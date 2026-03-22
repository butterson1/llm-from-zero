# Gün 6: Ön Eğitim — Modeller Dili İnternetten Nasıl Öğrenir

*Artık mimariyi anlıyorsunuz — Transformer'lar, dikkat, tokenizasyon. Ama mimari sadece iskelet. Büyük bir dil modelini gerçekten kullanışlı yapan şey ön eğitimdir: rastgele başlatılmış bir kayan nokta sayılar yığınının yüz milyarlarca token metin görerek bir şekilde şiir yazmayı, Python hatası ayıklamayı ve kuantum mekaniğini açıklamayı bilerek ortaya çıkması süreci. Bu nasıl çalışıyor? Ve iki temelden farklı yaklaşım — maskeli dil modelleme ve nedensel dil modelleme — neden bu kadar radikal biçimde farklı türde zekâ üretiyor?*

---

## İşe Yaramaması Gereken Mucize

Ön eğitimin aslında ne olduğuyla başlayalım, tüm mistisizmden arınmış: rastgele ağırlıklara sahip bir sinir ağı alıyorsunuz, devasa miktarda metin gösteriyorsunuz ve eksik ya da gelecek kelimeleri tahmin etmesini istiyorsunuz. Bu kadar. Kimse veriyi "bu kimyayla ilgili bir gerçek" ya da "bu cümle dilbilgisi olarak doğru" diye etiketlemiyor. Kimse ders planı hazırlamıyor ya da bilgiyi konuya göre organize etmiyor. Sadece interneti döküp gradyan inişinin işini yapmasına izin veriyorsunuz.

Sonuç? GPT-4 baro sınavını geçebiliyor (90. yüzdelik). BERT 2018'de geldiğinde her NLP ölçütünde devrim yarattı. PaLM 2 100'den fazla dil arasında çeviri yapabiliyor. Hepsi aynı temel reçeteden: metin tahmin et, ağırlıkları güncelle, tekrarla.

Düşünürseniz bu gerçekten tuhaf. Bir cümledeki sonraki kelimeyi tahmin etmek önemsiz, neredeyse mekanik bir görev gibi görünüyor — telefonunuzdaki otomatik tamamlamanın kötü yaptığı bir şey. Bunu büyütmek nasıl *muhakeme yapıyor* gibi görünen bir şey üretiyor?

Cevap, ilk kez OpenAI'daki Alec Radford ve Ilya Sutskever tarafından 2018 civarında açıkça dile getirilen ince bir kavrayışta yatıyor: **sonraki kelimeyi yeterince iyi tahmin etmek için, yeterince çeşitli bir korpus boyunca, bir model metnin tanımladığı dünyanın iç temsillerini inşa etmek zorundadır.** Eğitim verisi yörünge mekaniği hakkında binlerce pasaj içeriyorsa, model sadece yüzey kalıplarını ezberleyemez — uzay hakkındaki yeni bağlamlarda tutarlı biçimde doğru sonraki token'ı tahmin etmek için yerçekimi, hız ve eliptik yörüngelerin bir tür sıkıştırılmış anlayışını geliştirmek zorundadır.

Bunun "gerçek anlama" teşkil edip etmediği felsefi bir tartışma. Tartışılmayan, işe yaradığı.

## İki Tahmin Felsefesi

Ön eğitim iki ana çeşit gelir ve aradaki farkı anlamak, aynı temel Transformer mimarisini paylaşmalarına rağmen BERT ve GPT'nin neden bu kadar farklı olduğunu anlamanın anahtarıdır.

### Maskeli Dil Modelleme: Boşluk Doldur

2018'de Google araştırmacıları Jacob Devlin, Ming-Wei Chang, Kenton Lee ve Kristina Toutanova BERT'i (Transformer'lardan Çift Yönlü Kodlayıcı Temsilleri) tanıttı. Temel fikirleri zarifti: bir cümle al, token'ların %15'ini rastgele maskele ve modeli eksik olanı tahmin etmek için eğit.

Verilen: `Kedi minder üzerinde [MASK] ve mırıldandı`

Model `[MASK]`'ın muhtemelen "oturdu" ya da "uzandı" ya da "durdu" olduğunu tahmin etmeli. Bunu yapmak için *tüm* çevreleyen bağlama bakabilir — hem sola ("Kedi minder üzerinde") hem de sağa ("ve mırıldandı"). Bu çift yönlü bağlam BERT'in dili anlamadaki süper gücü.

Ama ayrıntılar önemli. BERT aslında seçilen token'ların hepsini maskelemez. Zekice bir tasarım seçimiyle, tahmin için seçilen token'ların:
- %80'i `[MASK]` ile değiştirilir
- %10'u rastgele bir token'la değiştirilir
- %10'u değiştirilmeden bırakılır

Neden bu garip görünen karışım? Saf maskeleme bir eğitim-test uyumsuzluğu yaratır: ince ayar sırasında model hiç `[MASK]` token'ı görmez, yani eğitilmediği girdilerle çalışması istenir. Rastgele değiştirme modeli *her* konum için iyi temsiller tutmaya zorlar (herhangi bir konum bozulmuş olabilir) ve değiştirilmemiş token'lar her şeyin şüpheli olmadığını öğretir.

BERT-base 110 milyon parametreye sahiptir ve yaklaşık 3,3 milyar token üzerinde eğitildi (BooksCorpus artı İngilizce Wikipedia). BERT-large 340 milyon parametreye ölçeklenir. BERT-base'i eğitmek 16 TPU çipinde 4 gün sürdü — bugünün standartlarıyla önemsiz. Google'ın toplam hesaplama maliyeti 2018 bulut fiyatlarıyla muhtemelen 10.000 doların altındaydı.

Eğitim ayrıca ikinci bir hedef içeriyordu: **sonraki cümle tahmini (NSP)**. İki cümle verildiğinde, B cümlesinin kaynak belgede A cümlesini gerçekten takip edip etmediğini ya da rastgele bir cümle olduğunu tahmin et. Fikir, modele cümleler arası ilişkileri öğretmekti. Sonraki araştırmalar (RoBERTa, 2019) NSP'nin aslında performansı *düşürdüğünü* gösterdi — çok kolay bir görevdi ve eğitim sinyalini seyreltiyordu. RoBERTa NSP'yi bıraktı, 10 kat daha fazla veriyle (160GB metin) eğitildi, dinamik maskeleme kullandı (her dönemde farklı maskeler) ve her ölçütte BERT'i geçti.

### Nedensel Dil Modelleme: Sıradakini Tahmin Et

GPT zıt yaklaşımı benimser. Cümlenin tamamını görüp boşlukları doldurmak yerine, model metni soldan sağa görür ve her konumda sonraki token'ı tahmin eder. Bu **nedensel** (ya da **otoregresif**) dil modellemedir — model sadece mevcut konumdan önce gelen token'lara dikkat edebilir.

Verilen: `Kedi minder üzerinde`
Tahmin: `oturdu` (ya da `uzandı`, `durdu`, vb.)

Ama sadece tek bir sonraki token'ı tahmin etmez — eğitim sırasında *her konumda aynı anda* tahmin yapar. *n* token'lık bir dizi verildiğinde, model *n - 1* tahmin üretir (token 1'den token 2'yi tahmin et, token 1-2'den token 3'ü tahmin et, vb.). Bu hesaplama açısından verimlidir: bir dizi üzerinde tek bir ileri geçiş size birçok eğitim sinyali verir.

Orijinal GPT (Haziran 2018, BERT'ten iki ay önce) 117 milyon parametreye sahipti ve BookCorpus — kabaca 985 milyon token — üzerinde eğitildi. GPT-2 (Şubat 2019) 1,5 milyar parametreye ölçeklendi ve en az 3 karma alan Reddit gönderilerinden bağlanan web sayfalarından oluşan 40GB'lık WebText veri kümesi üzerinde eğitildi (zekice bir kalite filtresi). GPT-3 (Mayıs 2020) 175 milyar parametreye sıçradı, 300 milyar token üzerinde tahmini 4,6 milyon dolarlık hesaplama maliyetiyle eğitildi. GPT-4 (Mart 2023), kesin boyutu açıklanmamış olsa da, 1 trilyonun üzerinde parametreli uzmanlar karışımı modeli olduğu tahmin edilmekte ve yaklaşık 13 trilyon token üzerinde 100 milyon doları aşan maliyetle eğitildi.

Nedensel DM'nin kilit sınırlaması modelin sadece geriye bakabilmesi. "Kedi ___'yi kovaladı" cümlesindeki eksik kelimeyi tahmin ederken, soldan sağa işleyen nedensel bir model henüz "kovaladı"yı görmemiştir — dolayısıyla cümlenin tamamını gören BERT'ten daha az bilgiyle çalışmak zorundadır. Bu, nedensel modelleri çift yönlü bağlamın önemli olduğu *anlama* görevlerinde doğası gereği daha zayıf kılar.

Peki nedensel DM neden kazandı?

## GPT Neden Kazandı ve BERT Neden Kazanamadı

Bu, yapay zekâ tarihindeki en önemli stratejik ayrışmalardan biri ve cevap yanıltıcı biçimde basit: **üretim yapmak zordur ama sınıflandırmadan daha yararlıdır.**

BERT anlamada parlıyor: duygu analizi, soru yanıtlama, adlandırılmış varlık tanıma, doğal dil çıkarımı. 2018'den yaklaşık 2022'ye kadar geçen dönemde BERT ve torunları (RoBERTa, ALBERT, DeBERTa, ELECTRA) NLP ölçütlerine hâkim oldu. Metin sınıflandırmanız, bilgi çıkarmanız ya da sorguları belgelerle eşleştirmeniz gerekiyorsa, BERT ailesi modeller cevaptı.

Ama BERT yazamaz. Mimarisi metni çift yönlü görür, bu da metni otoregresif biçimde üretemeyeceği anlamına gelir — birbiri ardına token üretmenin doğal bir yolu yoktur. Üretim görevlerine zorlayabilirsiniz (ve T5 gibi modeller bu boşluğu köprüleyen kodlayıcı-kod çözücü yapı kullanır), ama saf yalnızca-kodlayıcı modeller temelde mevcut metni *analiz etmekle* ilgilidir, yeni metin yaratmakla değil.

GPT ise doğal bir metin üretecidir. Ve metin üretmenin — sohbet botları, yazma asistanları, kod tamamlama, çeviri — tüketicilerin ve işletmelerin gerçekten ödeme yapmak istediği şey olduğu ortaya çıktı. Kasım 2022'de ChatGPT'nin lansmanı iki ayda 100 milyon kullanıcıya ulaştı. BERT ile ChatGPT inşa edemezsiniz.

Daha derin bir teknik neden de var. **Nedensel dil modelleri ölçeklendikçe anlamada daha iyi olur, ama maskeli dil modelleri ne kadar büyürse büyüsün üretimde daha iyi olmaz.** Bunun nedeni, muazzam ölçekte otoregresif eğitimin modeli dilin öyle detaylı tahmin modelleri öğrenmeye zorlamasıdır ki anlama bir yan ürün haline gelir. GPT-4 duygu analizi gayet iyi yapabilir — doğal dilde sormanız yeter. Ama BERT'in hiçbir versiyonu, ne kadar büyük olursa olsun, tutarlı bir makale yazamaz.

Bu yüzden alan öncü modeller için yalnızca-kod çözücü Transformer'larda (GPT-3, PaLM, Chinchilla, LLaMA, Claude, Gemini) yakınsarken, BERT ailesi modeller sınıflandırma ve bilgi erişimi için verimli, uzmanlaşmış araçlar olarak niş bir role yerleşti.

## Kodlayıcı-Kod Çözücü Orta Yol

Üçüncü bir yol da var. Google'ın T5'i (Metinden-Metine Transfer Transformer, 2019) *her* NLP görevini metinden-metine olarak yeniden çerçeveledi: sınıflandırma "sınıfla: [girdi]" → "olumlu" olur, çeviri "İngilizce'den Fransızca'ya çevir: [girdi]" → "[çıktı]" olur. T5 tam kodlayıcı-kod çözücü Transformer mimarisini kullanır — kodlayıcı girdiyi çift yönlü (BERT gibi) işler, kod çözücü çıktıyı otoregresif (GPT gibi) üretir.

T5, **span bozma** adlı maskeli dil modelleme varyantıyla eğitildi: bireysel token'ları maskelemek yerine bitişik metin aralıklarını maskeler ve her aralığı bir nöbetçi token'la değiştirir. Model daha sonra eksik aralıkları üretmek zorundadır. Bu, tekli token maskelemeden daha zorludur ve modele uzun menzilli bağımlılıklar öğretir.

T5-11B (11 milyar parametre) Colossal Clean Crawled Corpus (C4) üzerinde eğitildi — yaklaşık 750GB temizlenmiş İngilizce web metni, yaklaşık 156 milyar token. Yayınlandığında çok sayıda ölçütte en ileri sonuçları elde etti.

Google daha sonra bu yaklaşımı PaLM'a (540 milyar parametre) ölçekledi, ancak PaLM yalnızca-kod çözücü, nedensel DM yaklaşımına geçti — BERT ve T5'in doğduğu Google'da bile alanın otoregresif eğitimde yakınsadığının kanıtı.

## Ön Eğitim Sırasında Gerçekte Ne Olur

Mekaniğe yakından bakalım. Büyük bir dil modelini ön eğitmek çeşitli aşamaları içerir ve her biri kendi başına bir mühendislik kabusudur.

### Adım 1: Veri Hazırlama

Herhangi bir gradyan akmadan önce veriye ihtiyacınız var. Modern öncü modeller trilyonlarca token ölçüsünde veri kümeleri üzerinde eğitilir. LLaMA 3 (Nisan 2024) 15 trilyon token üzerinde eğitildi. Bu veri kümeleri web taramalarından (Common Crawl petabaytlarca ham HTML sağlar), kitaplardan, akademik makalelerden, kod depolarından (GitHub, Stack Overflow) ve Wikipedia gibi derlenmiş kaynaklardan oluşturulur.

Ham veri kapsamlı filtrelemeden geçer: tekilleştirme (tam ve yakın-kopya kaldırma), dil tanımlama, kalite filtreleme ("yüksek kaliteli" metni "düşük kaliteli"den ayırt etmek için eğitilmiş sınıflandırıcılar kullanarak), kişisel tanımlayıcı bilgilerin kaldırılması ve içerik filtreleme. Dolma veri kümesi (OLMo için kullanılan) bu sürecin ayrıntılı belgelendirmesini yayınladı — hatları temizlemeden sonra 5,4 trilyon token'ı 3 trilyona indirdi.

Veri karışım oranları muazzam önem taşır. LLaMA 1 kabaca %67 web verisi, %15 kod, %4,5 Wikipedia, %4,5 kitap ve daha küçük ArXiv ve Stack Exchange bölümleri kullandı. Bu oranları yanlış tutmak modeli felce uğratabilir: çok fazla kod ve her şeyi programcı gibi yazar; çok az ve kod yazamaz; çok fazla Wikipedia ve ansiklopedi gibi konuşur.

### Adım 2: Ağırlık Başlatma

Modelin parametreleri rastgele başlatılır — tipik olarak özenle seçilmiş standart sapmalarla kırpılmış normal dağılımdan çekilir. Başlatma şeması önemlidir: çok büyük olursa gradyanlar patlar; çok küçük olursa söner. GPT tarzı modeller genellikle 1/√(n) olarak ölçeklenen bir varyans kullanır (n katman boyutu), artık bağlantılar için ek bir 1/√(2N) ölçeklemesiyle (N katman sayısı).

Bu noktada model tamamen saçmalık üretir. Tahminleri esasen tüm sözlük boyunca düzgün dağılımlıdır — her token eşit derecede olasıdır. Çapraz entropi kaybı yaklaşık log(V)'dir, V sözlük boyutu. 100.000 token'lık bir sözlük için bu yaklaşık 11,5 nat'tır.

### Adım 3: Eğitim Döngüsü

Eğitim veriyi gruplar halinde işler. Modern LLM'ler devasa grup boyutları kullanır: GPT-3, 3,2 milyon token'lık bir grup boyutu kullandı (dinamik, küçük başlayıp artan). LLaMA 2, 4 milyon token'lık grup boyutu kullandı. Her grup bir ileri geçiş (tahminleri hesapla), kayıp hesaplama (tahminler ne kadar yanlıştı) ve geri geçiş (her parametre için gradyanları hesapla) gerektirir.

Optimize edici neredeyse her zaman AdamW — ayrıştırılmış ağırlık azalması ile Adam. Öğrenme hızı bir takvim izler: ilk ~2.000 adım için doğrusal ısınma (erken istikrarsızlıktan kaçınmak için), ardından tepe öğrenme hızının yaklaşık %10'una kadar kosinüs azalması. Tipik tepe öğrenme hızları büyük modeller için yaklaşık 3 × 10⁻⁴, çok büyük olanlar için 1 × 10⁻⁴.

LLaMA 2 70B'yi eğitmek A100 80GB GPU'larda yaklaşık 1,7 milyon GPU-saat aldı. GPU-saat başına kabaca 2 dolarla (2023 bulut fiyatları), bu yaklaşık 3,4 milyon dolarlık hesaplama — ve bu başarısız denemeleri, hiperparametre aramalarını ve mühendislik maliyetlerini saymıyor.

### Adım 4: Kayıp Düşer, Zekâ Yükselir

Eğitim ilerledikçe kayıp, olağanüstü öngörülebilir bir kuvvet yasası eğrisinde düzgün biçimde azalır. 10 milyar token'da bir modelin kaybı 3,5 olabilir; 100 milyar token'da 2,8; 1 trilyonda 2,3. Bu öngörülebilirlik ölçekleme yasalarını mümkün kılan şeydir — 10 kat daha büyük bir eğitim sürecinin performansını daha küçük deneylerden tahmin edebilirsiniz.

Ama bu düzgün kayıp düşüşünden ortaya çıkan yetenekler hiç de düzgün değildir. Bir noktada, tamamen sonraki-token tahmini üzerinde eğitilmiş bir model aritmetik yapmaya başlar. Sonra çok adımlı muhakeme. Sonra kod üretimi. Sonra açıkça çeviri öğretilmemiş diller arasında çeviri. Kayıp eğrisi bu yeteneklerin ne zaman ortaya çıkacağına dair ipucu vermez — belirli ölçeklerde aniden açılıyor gibi görünürler.

İşte hâlâ araştırmacıları şaşırtan sezgiye aykırı gerçek: **sadece sonraki token'ı tahmin etmek için eğitilmiş bir model tıp lisans sınavlarını geçebilir, hukuki sözleşmeler yazabilir ve yarışma matematik problemlerini çözebilir.** Kimse bunları yapması için tasarlamadı. Kimse eğitim verisini "tıbbi bilgi" ya da "hukuki muhakeme" olarak etiketlemedi. Model bu görevler için yeterli iç yapıyı tamamen metni iyi tahmin etmenin istatistiksel baskısından öğrendi.

## Hiçbir Şeyi Unutmamak

Ön eğitimin olağandışı bir özelliği var: model her eğitim verisini çok az kez görür. GPT-3 eğitim verisi üzerinde kabaca bir geçiş yaptı. LLaMA çoğu veri üzerinde 1-2 dönem eğitildi. Bu, insanların öğrenme şeklinden temelden farklı — biz tekrar okur, pratik yapar ve pekiştiririz. Yine de bu modeller dikkat çekici bir hafıza sergiliyor.

Diğer yüzü, ön eğitim sırasında modelin öğrendiği her şeyin ağırlıklarına kalıcı olarak işlenmesidir. Güncel olmayan bilgiyi seçici olarak unutamaz, eğitim sonrası bilgisini güncelleyemez ve üzerinde eğitildiği güvenilir kaynaklarla güvenilmez kaynakları ayırt edemez. Eğitim verisi ABD başkanının Joe Biden olduğunu söylüyorsa (veri 2023'te toplandığı için), model 2026'da bile bunu güvenle iddia edecektir. Bu, bilgi kesme problemidir ve ön eğitim paradigmasının temel bir sınırlamasıdır.

Bu yüzden ön eğitim sadece başlangıç. Ham ön eğitimli model tuhaf bir yaratık — herhangi bir metin kalıbını tamamlayabilir, ama *yardımcı* olmayı bilmez. Bir soru sorun, sorunuzu başka bir soruyla tamamlayabilir ya da Wikipedia makalesi yazıyormuş gibi devam edebilir. Bu kalıp-tamamlama motorunu kullanışlı bir asistana dönüştürmek, hattın sonraki adımlarını gerektirir: ince ayar ve hizalama — ki buraya doğru ilerliyoruz.

---

## Temel Çıkarımlar

- **Maskeli DM (BERT)** metni çift yönlü görür ve maskeli token'ları tahmin eder — anlama için harika, üretim yapamaz
- **Nedensel DM (GPT)** metni soldan sağa görür ve sonraki token'ı tahmin eder — doğal biçimde üretir ve anlama ölçekte kendiliğinden ortaya çıkar
- **Nedensel DM kazandı** çünkü üretim kullanıcıların istediği şey ve anlama ölçekte bedavaya gelir
- **Ön eğitim verisi** trilyonlarca token'la ölçülür, web taramalarından, kitaplardan, koddan ve derlenmiş kaynaklardan oluşturulur
- **Eğitim döngüsü** öğrenme hızı ısınması ve kosinüs azalmasıyla AdamW optimizasyonu kullanır, grup başına milyonlarca token işler
- **Ortaya çıkan yetenekler** — muhakeme, çeviri, kod — sonraki-token tahmininin istatistiksel baskısından kendiliğinden belirir
- **Bilgi donmuştur** ön eğitim sonrası, RAG ve ince ayarın çözmeye çalıştığı kesme problemini yaratır

---

*Yarın: **Ölçekleme Yasaları** — probleme daha fazla veri ve hesaplama atmak neden çalışmaya devam ediyor? Kaplan ve Chinchilla makaleleri model boyutu, veri ve performans arasındaki kesin matematiksel ilişkileri ortaya çıkardı. Bu kuvvet yasalarının neden geçerli olduğunu, gelecek modeller için ne tahmin ettiğini ve kimsenin bulamadığı bir tavan olup olmadığını keşfedeceğiz.*

<div style="margin-top: 2em;">

<a href="quizzes/day-06.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 6 Quizini Çöz →</a>

</div>
