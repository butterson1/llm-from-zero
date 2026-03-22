# Gün 8: Eğitim Altyapısı — GPU'lar, Kümeler, Veri Hatları ve 100 Milyon Dolara Ne Alırsınız

*Dün dil modellerinin performansının temiz kuvvet yasalarını takip ettiğini öğrendiniz — 10 kat daha fazla hesaplama harca, kayıpta öngörülebilir bir düşüş elde et. Bugün bariz takip sorusunu soruyoruz: "hesaplama harcamak" pratikte gerçekte ne anlama geliyor? Öncü bir modeli eğitmenin arkasındaki fiziksel makineler, yazılım yığınları, mühendislik kabusları ve salt dolar rakamları neler? Cevap, egzotik ağ donanımıyla bağlanan binlerce GPU, aylarca kesintisiz çalışma ve bir NASA mühendisini ağlatacak arıza oranlarını içeriyor.*

---

## GPU: Zekânın Dövüldüğü Yer

Bugün hayatta olan her büyük dil modeli NVIDIA GPU'larında doğdu. CPU'lar değil, TPU'lar değil (Google modelleri kayda değer istisna), özel ASIC'ler değil. NVIDIA'nın yapay zekâ eğitimindeki hâkimiyeti modern teknolojideki en dengesiz tekellerden biri ve GPU'yu anlamak, eğitim altyapısını anlamanın ilk adımı.

Modern bir NVIDIA H100 GPU — 2024-2025 öncü eğitiminin iş atı — oyun kâğıdı boyutundaki bir çip üzerine sıkıştırılmış 80 milyar transistör içerir. Saniyede 3,35 terabayt hızında veri taşıyabilen 80 GB HBM3 (Yüksek Bant Genişlikli Bellek) belleğe sahiptir ve saniyede yaklaşık 990 teraflop BF16 matris çarpımı yapabilir. Bağlam için: tek bir H100, 1024×1024'lük iki matrisi yaklaşık 2 mikrosaniyede çarpabilir — hesap makineli bir insanın birkaç ömür süreceği bir hesaplama.

Ama LLM eğitimi için en önemli ham rakam tepe flop değil. **Bellek bant genişliğidir**. Eğitim sırasında GPU sürekli model ağırlıklarını okur, gradyanları hesaplar ve güncellenmiş ağırlıkları belleğe geri yazar. BF16'da 70 milyar parametreli bir modelin ağırlıkları yaklaşık 140 GB yer kaplar — tek bir H100'ün belleğinin neredeyse iki katı. Model boyutu ve GPU bellek kapasitesi arasındaki bu temel gerilim, eğitim altyapısındaki neredeyse her mimari kararı yönlendirir.

En yeni nesil NVIDIA B200 (Blackwell), 8 TB/s bant genişliğinde 192 GB HBM3e belleğe ve yaklaşık 2,25 petaflop FP4 hesaplamaya ulaşır. Tek bir Blackwell GPU yaklaşık 30.000-40.000 dolara mal olur, ancak etiket fiyatı neredeyse önemsiz — bulunabilirlik o kadar kısıtlı ki bulut fiyatları gerçek hikâyeyi anlatır. 2026 başı itibariyle, spot pazarda H100 kiralamak GPU-saat başına yaklaşık 2-3 dolar, Blackwell B200'ler ise GPU-saat başına 5-8 dolar.

Google'ın alternatifi TPU (Tensor İşlem Birimi), Gemini'yi güçlendirdiği için anılmayı hak ediyor. TPU v5p çipleri, Google'ın özel ICI'ı (Çipler Arası Bağlantı) ile çip başına 4,8 Tbps hızında 8.960 çiplik "pod"larda birbirine bağlanır. Google TPU'ları doğrudan satmaz — Google Cloud üzerinden kiralarsınız — ama dahili olarak Gemini eğitimi için on binlerce TPU dağıtmıştır. TPU'nun avantajı çip başına ham performans değil, Google'ın uçtan uca kontrol ettiği sıkıca entegre ağ ve yazılım altyapısıdır.

## Tek GPU'dan On Binlercesine: Paralellik Problemi

İşte büyük model eğitimi hakkında rahatsız edici gerçek: tek bir GPU, ne kadar güçlü olursa olsun, komik derecede yetersizdir. LLaMA 3 405B eğitmek H100'lerde tahminen 30,8 milyon GPU-saat gerektirdi. Bunu tek GPU'da çalıştırsanız yaklaşık 3.500 yıl sürerdi. Birkaç ayda bitirmek için binlerce GPU'nun uyum içinde çalışması gerekir. Meta, LLaMA 3 405B için yaklaşık 16.384 H100 GPU kullandı. OpenAI'ın GPT-4 için 20.000+ H100 kullandığı söyleniyor ve yeni nesil Stargate kümelerinin 100.000'in üzerinde GPU hedeflediği bildiriliyor.

Binlerce GPU'yu tek bir hesaplamada işbirliğine sokmak, çözülmüş en zor dağıtık sistem problemleri arasındadır. Üç temel strateji var ve modern eğitim süreçleri üçünü de aynı anda kullanır:

### Veri Paralelliği

En basit fikir: her GPU'ya modelin tam bir kopyasını ver, ama her GPU'ya farklı bir mini-grup veri besle. Her GPU kendi veri dilimi üzerinde gradyanları hesaplar, sonra tüm GPU'lar ağırlıkları güncellemeden önce gradyanlarını ortalar. 1.000 GPU'nuz varsa aynı anda 1.000 mini-grup işlersiniz, çıktınızı etkin biçimde 1.000 kat çarparsınız.

Sorun, gradyan ortalamanın **tümü-azalt** (all-reduce) iletişimi gerektirmesi — her GPU gradyanlarını diğer her GPU ile paylaşmalıdır. BF16'da 70B parametreli bir model için bu, binlerce makine arasında iletilip ortalaması alınması gereken 140 GB gradyan verisi demek. Standart algoritma olan halka tümü-azalt, veriyi mantıksal bir GPU halkası etrafında iletir ve her GPU'nun kabaca 2 × 140 GB veri göndermesini ve almasını gerektirir. 400 Gbps (yaklaşık 50 GB/s) InfiniBand hızlarında bu birkaç saniye sürer — GPU'ların boşta bekleyerek oturduğu süre.

### Tensör Paralelliği

Modelin katmanları tek bir GPU'nun belleğine sığmayacak kadar büyük olduğunda, bireysel katmanları birden fazla GPU'ya bölersiniz. Tek bir dikkat başının ağırlık matrisi 8 GPU arasında sütun bazında dilimlenerek her biri çıktının bir kısmını hesaplar. Buna tensör paralelliği (bazen model paralelliği de denir) adı verilir ve NVIDIA'nın Megatron-LM çerçevesi tarafından öncülük edilmiştir.

Tensör paralelliği son derece iletişim yoğundur — her katman GPU'lar arasında tümü-azalt işlemleri gerektirir çünkü her GPU sadece kısmi bir sonuç tutar. Bu, yalnızca GPU'lar mümkün olan en hızlı bağlantılarla bağlandığında iyi çalışır. NVIDIA DGX H100 sunucusu içinde 8 GPU, çift yönlü 900 GB/s bant genişliğinde NVLink ile bağlıdır — sunucular arası ağ bağlantısından kabaca 18 kat daha hızlı. Bu yüzden tensör paralelliği tipik olarak tek düğüm içindeki GPU'larla (8 GPU) sınırlandırılır, düğümler arası boyutu diğer paralellik stratejileri idare eder.

### Boru Hattı Paralelliği

Katmanları yatay olarak GPU'lara bölmek yerine, boru hattı paralelliği katmanların tamamını farklı GPU'lara dikey olarak atar. GPU 0 katman 1-10'u, GPU 1 katman 11-20'yi idare eder, vb. Veri montaj hattı gibi boru hattından akar.

Sorun "boru hattı baloncuğu" — GPU 0 işini bitirir ve sonuçları GPU 1'e iletir, sonra GPU 1 hesaplarken boşta oturur. PipeDream (Microsoft, 2019) ve daha sonra Megatron-LM bunu **mikro-gruplama** ile çözdü: her mini-grubu daha küçük mikro-gruplara böl, böylece GPU 0 birincisi üzerinde GPU 1 çalışırken sonraki mikro-grubu işlemeye başlayabilir. Serpiştirilmiş zamanlama boru hattı baloncuğunu toplam sürenin %5'inin altına indirebilir, ama mikro-grup sayısı ile boru hattı aşamalarının dikkatle ayarlanmasını gerektirir.

### Üç Boyutlu Izgara

Pratikte, LLaMA 3 405B gibi bir eğitim süreci üç stratejiyi de aynı anda kullanır. 3B bir ızgara hayal edin: düğüm içindeki 8 GPU **tensör paralelliği**, 16 düğüme yayılan 16 boru hattı aşaması **boru hattı paralelliği** ve 128 böyle boru hattı kopyası **veri paralelliği** kullanır. Bu 8 × 16 × 128 = 16.384 GPU, Meta'nın kabaca kullandığı miktar.

Bu 3B ızgarayı doğru yapılandırmak kısmen mühendislik, kısmen karabüyüdür. Optimal yapılandırma model mimarisine, kümenin ağ topolojisine ve NVLink (düğüm içi), InfiniBand (düğümler arası) ve Ethernet (raf arası) göreli hızlarına bağlıdır. Yanlış yapmak etkin çıktınızı yarıya indirebilir.

## Ağ: InfiniBand, RoCE ve Neden Bant Genişliği Her Şeydir

GPU beyinse, ağ sinir sistemidir — ve büyük ölçekli eğitimde ağ genellikle darboğazdır. Yapay zekâ eğitim kümelerindeki baskın ağ teknolojisi **InfiniBand**, özellikle port başına 400 Gbps sağlayan NVIDIA'nın Quantum-2 anahtarlarıdır (Quantum-3, 800 Gbps'ye çıkıyor).

Bir eğitim kümesinin ağı tipik olarak **şişman ağaç** topolojisine sahiptir: GPU'lar yaprak anahtarlara, yaprak anahtarlar omurga anahtarlarına bağlanır ve omurga anahtarları tam kesit bant genişliği sağlar — yani herhangi bir GPU, fiziksel konumdan bağımsız olarak başka herhangi bir GPU ile aynı hızda iletişim kurabilir. 16.000 GPU için tam şişman ağaç, binlerce anahtar ve yüzlerce kilometre fiber optik kablo gerektirir.

> 💡 **InfiniBand neden Ethernet'ten farklı?** InfiniBand, RDMA (Uzaktan Doğrudan Bellek Erişimi) ile çalışır — veriler CPU'yu atlatarak doğrudan GPU belleğinden GPU belleğine aktarılabilir. Bu, geleneksel Ethernet'in yazılım yığınından geçme gerekliliğini ortadan kaldırarak mikrosniye düzeyinde gecikme sağlar.

## Arıza: İstisna Değil, Norm

Bu bizi büyük ölçekli eğitimin belki de en hafife alınan yönüne getiriyor: **sürekli bir şeyler bozulur**. 16.384 GPU'yu haftalarca çalıştırdığınızda arızalar nadir olaylar değil — istatistiksel kesinliklerdir.

Meta'nın LLaMA 3 altyapı makalesi bunda dikkat çekici derecede açık. LLaMA 3 405B'nin 54 günlük ön eğitim süreci boyunca **419 beklenmeyen iş kesintisi** yaşadılar. Günde kabaca 8 çökme. Bunların 148'i doğrulanmış donanım sorunlarından kaynaklanıyordu: 78 GPU arızası, 17 ana makine düzeyinde sorun ve ağ anahtarları, kablolar ve depolama sistemleri dahil 53 diğer sorun.

Her arıza bir **kontrol noktası kurtarma** döngüsü tetikler. Eğitim periyodik olarak tüm model durumunu (ağırlıklar, optimize edici durumları, öğrenme hızı takvimleri) kalıcı depolamaya kaydeder — kontrol noktası. Arıza oluştuğunda, arızalı GPU ya da düğüm değiştirilir ve eğitim son kontrol noktasından devam eder. 405B model için kontrol noktası kaydetme, kabaca 3-4 TB veri (parametre başına 18 bayt olarak ağırlıklar + Adam optimize edici durumları) yazar. 16.384 GPU'da bunu depolamaya yazmak birkaç dakika sürer, bu süre boyunca tüm GPU'lar eğitimi duraklatır.

Meta, iki aşamalı yaklaşımla kontrol noktası süresini yaklaşık 2 dakikaya indirdi: önce her GPU yerel NVMe SSD'ye yazar (hızlı), sonra veri asenkron olarak dağıtık dosya sistemine çoğaltılır (daha yavaş ama engellemesiz). Bu optimizasyon olmadan kontrol noktası toplam eğitim süresinin %5-10'unu tüketebilirdi.

## Yazılım Yığını: CUDA, PyTorch ve Önemli Çerçeveler

Tüm bu donanımı orkestra eden yazılım eşit derecede karmaşık.

**CUDA** NVIDIA'nın paralel hesaplama platformu ve NVIDIA'nın tekelini koruyan gerçek hendek. CUDA, PyTorch'un çağırdığı düşük düzey çekirdekleri (matris çarpımı, dikkat hesaplaması, aktivasyon fonksiyonları) sağlar. Dünyadaki her yapay zekâ araştırmacısı sonunda CUDA çekirdeklerine derlenen kod yazar.

**PyTorch**, Meta, Anthropic ve alanın çoğunluğu tarafından kullanılan baskın eğitim çerçevesidir (Google JAX'ı tercih eder). **Megatron-LM** (NVIDIA) ve **DeepSpeed** (Microsoft) PyTorch üzerinde oturarak tensör paralelliği, boru hattı paralelliği ve gelişmiş bellek optimizasyonlarını uygular. DeepSpeed'in ZeRO'su (Sıfır Artıklık Optimize Edici) özellikle önemli: optimize edici durumlarını, gradyanları ve hatta model ağırlıklarını veri-paralel gruptaki GPU'lara böler, GPU başına bellek kullanımını dramatik biçimde azaltır.

**Karma hassasiyet eğitimi** evrenseldir. Modeller BF16'da (bfloat16, 8 üs biti ve 7 mantis biti olan 16-bit format) eğitilir; bu, kararlı gradyanlar için yeterli dinamik aralık korurken FP32'ye kıyasla bellek kullanımını yarıya indirir. Kritik birikmeler (gradyan ortalaması gibi) sayısal kayma önlemek için FP32'de yapılır.

## Veri Hattı: Canavarı Beslemek

GPU'lar tüm ilgiyi çekerken, veri hattı eşit derecede kritik. 15 trilyon token üzerinde model eğitmek, kabaca 30-60 TB tokenize metin okumayı gerektirir. Bu veri, hiçbir GPU'nun veri beklemesi gerekmeyecek kadar hızlı karıştırılıp, gruplanıp GPU'lara teslim edilmelidir.

Tipik hat: ham metin dağıtık dosya sisteminde bulunur. Ön işleme adımı metni tokenize eder, belgeleri ayırıcı token'larla birleştirir ve modelin bağlam uzunluğu dizilerine paketler. Bunlar, tüm veri kümesini RAM'e yüklemeden rastgele erişilebilen bellek eşlemeli ikili dosyalar olarak depolanır.

Karıştırma stratejisi düşündüğünüzden daha fazla önem taşır. Aynı kaynaktan belgeler ardışık görünürse model o kaynağın stiline geçici olarak aşırı uyum sağlayabilir ve kayıp sıçramalarına neden olabilir. Çoğu ekip veriyi belge düzeyinde önceden karıştırır, sonra dizi düzeyinde ikinci bir karıştırma yapar.

## 100 Milyon Dolar Gerçekte Ne Alır

Somutlaştıralım. 2025'te sıfırdan öncü bir model eğitmek kabaca şunları gerektirir:

**Donanım kirası:** 3 ay için GPU-saat başına ~2,50 dolardan 16.000 H100 GPU = yalnızca hesaplamada **87 milyon dolar**. Kendi kümenizi inşa ediyorsanız (Meta, Google ve xAI gibi), 16.000 H100 için sermaye harcaması yaklaşık 500-600 milyon dolar, ama birden fazla eğitim süreci ve yıllar boyunca amorti edilir.

**Ağ:** 16.000 GPU için tam InfiniBand şişman ağaç 50-100 milyon dolara mal olur. 30+ megawatt küme için güç ve soğutma altyapıda ek 20-50 milyon dolar ekler.

**Veri:** Ham veri çoğunlukla ücretsiz ama işleme, filtreleme, tekilleştirme ve hukuki inceleme mühendislik zamanı ve hesaplamada 5-20 milyon dolara mal olur.

**İnsanlar:** 30-50 makine öğrenmesi mühendisi, altyapı mühendisi ve araştırmacıdan oluşan ekip, kişi başı tam yüklü maliyeti 300-500K dolarla, yıllık 10-20 milyon dolar tutar.

**Elektrik:** Her biri 700W'lık 16.000 H100 yaklaşık 11,2 MW çeker, soğutma dahil tesis gücü ~18-20 MW olur. kWh başına 0,05 dolarla üç aylık eğitim elektrikte yaklaşık **6,5 milyon dolar**.

Toplamda, 2025-2026'da tek bir öncü eğitim süreci **100-300 milyon dolar**, donanımı mı kiraladığınıza, nerede olduğunuza ve iyi bir sonuç almadan önce kaç başarısız denemeden geçtiğinize bağlı. GPT-5 ve Gemini Ultra'nın haleflerinin eğitim hesaplaması için 500 milyon ile 1 milyar dolar bütçeledikleri bildiriliyor.

Ve sezgiye aykırı kısım: **o paranın çoğu başarısız deneylere harcanır**. Yukarıdaki rakamlar tek bir başarılı eğitim sürecini tarif eder. Ama o süreçten önce, 1/10 ya da 1/100 ölçekte hiperparametreleri, veri karışımlarını ve mimari seçenekleri test eden düzinelerce küçük deney vardır.

## Güç (ve Soğutma) Problemi

Yapay zekâ eğitiminin salt enerji tüketimi jeopolitik bir mesele haline geldi. NVIDIA'nın yeni nesil GB200 NVL72 rafı — 72 Blackwell GPU içeren tek bir raf — **120 kilowatt** tüketir ve sıvı soğutma gerektirir. 100.000 böyle GPU'luk bir küme 167 megawatt çekerdi — küçük bir doğalgaz santralinin çıktısı.

Bu yüzden şirketler nükleer santrallerle uzun vadeli enerji satın alma anlaşmaları imzalıyor, hidroelektrik barajlarının yanına veri merkezleri inşa ediyor ve hatta yapay zekâ tesisleri için küçük modüler reaktörleri (SMR) araştırıyor. Microsoft, yapay zekâ iş yüklerini güçlendirmek için Three Mile Island 1. Ünitesini yeniden başlatmak üzere anlaşma imzaladı.

Sıvı soğutma, bir zamanlar egzotik olan, artık yapay zekâ eğitim kümeleri için standart. H100 ve B200, soğutulmuş suyun doğrudan GPU modüllerinin üzerinden aktığı sıvı soğutmalı taban plakaları için tasarlanmış "SXM" form faktörlerinde mevcut.

## xAI Colossus: Hıza Dair Bir Vaka Çalışması

Modern küme inşasının belki de en dramatik örneği, xAI'ın Memphis, Tennessee'deki Colossus kümesi. 2024 yazında, Elon Musk'ın xAI ekibi yaklaşık 122 günde 100.000 H100 GPU'luk küme inşa etti — boş depodan çalışan eğitim işlerine. Bağlam için, geleneksel veri merkezi inşası 18-24 ay sürer. Colossus'un 3 milyar doların üzerinde maliyeti olduğu ve yaklaşık 150 megawatt güç tükettiği bildiriliyor.

## Bu Alan İçin Ne Anlama Geliyor

Eğitim altyapısı yapay zekâda giderek tanımlayıcı rekabet avantajı haline geliyor. Algoritmik yenilikler makalelerde yayınlanır ve aylar içinde alana yayılır. Ama 100.000 GPU'luk küme inşa etmek, dünya sınıfı altyapı mühendisleriyle kadrolamak, güç sözleşmeleri müzakere etmek ve verimli çalıştırmak için tescilli dağıtık eğitim çerçeveleri geliştirmek — bu, çok yıllık, çok milyar dolarlık bir hendek.

Bu yüzden yapay zekâ yarışı sermaye ve altyapıya erişimi olan bir avuç oyuncu etrafında konsolide oldu: OpenAI (Microsoft'un Azure'u destekli), Google DeepMind (TPU fabrikaları ve veri merkezlerine sahip), Meta (kendi kümelerini inşa eden), Anthropic (AWS ve Google Cloud ile ortaklık) ve xAI. Öncü model eğitmek artık bir yüksek lisans projesi değil — yarı iletken fabrikası inşa etme ya da uydu dizisi fırlatma ölçeğinde endüstriyel bir operasyon.

---

*Yarın, bu devasa altyapıdan akan şeye bakacağız: eğitim verisinin kendisi. CommonCrawl, The Pile ve LLM'lere bilgilerini — ve önyargılarını, halüsinasyonlarını ve hukuki baş ağrılarını — veren veri kümelerinin kirli sırları.*

---

<div style="margin-top: 2em; padding: 1.5em; background: #1a1a2e; border-radius: 8px; border: 1px solid #16213e;">

## 📝 Quiz — Gün 8

Bugünkü dersten ne öğrendiğinizi test edin.

<a href="quizzes/day-08.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 8 Quizini Çöz →</a>

</div>
