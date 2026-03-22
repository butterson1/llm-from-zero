# Gün 9: Veri — CommonCrawl, The Pile ve Eğitim Verisinin Kirli Sırrı

*Dün makine odasını gördünüz: H100'ler, InfiniBand dokusu, 20 megawatt güç çekişi, gece 3'te kontrol noktası kurtarmalar. Bugün tüm bu donanımın gerçekte ne çiğnediğine bakıyoruz. Büyük dil modelleri burada saf matematikten endüstriyel tarıma dönüşüyor. Model biçerdöver. İnternet tarla. Ve modern yapay zekânın tuhaf gerçeği, hasadın en az makine kadar önemli olması.*

---

## Model Dünyayı Metnin Egzozunu Yiyerek Öğreniyor

Bir dil modeli genellikle "internet üzerinde eğitilmiş" olarak tarif edilir ki bu, bir insanın "gıdayla" beslendiğini söylemek gibidir. Teknik olarak doğru, neredeyse işe yaramaz. Gerçek hikâye sadece ne kadar veri girdiği değil, ne tür metinler, hangi oranlarda, hangi filtrelemeden sonra, hangi kopyalar çıkarılarak ve hangi yasal ve kültürel kör noktalar işlenerek.

Bu önemli çünkü ön eğitim veritabanı sorgusu değil. Model düzgün bir bilgi fişi katalog depolamaz. Korpusundaki istatistiksel düzenlilikleri milyarlarca parametreye sıkıştırır. Aslında eğitim seti modelin duyusal dünyası olur. Korpus Reddit tartışmalarını, SEO çamurunu, şablon hukuki metinleri, Python kodunu ya da hayran kurguyu fazla temsil ediyorsa, model o ekolojiyi içselleştirir. "Sağduyusu" aslında veri kümesinin nasıl göründüğünün ağırlıklı ortalamasıdır.

Sezgiye aykırı gerçek şudur: **daha fazla veri genellikle daha kötü veridir**. Bir modele trilyonlarca düşük kaliteli token dökerseniz, sadece gürültü eklemiyorsunuz. Kıt hesaplamayı modele yanlış istatistiksel alışkanlıklar öğretmeye harcıyorsunuz.

## Common Crawl: Her Şeyin Başladığı Okyanus

Açık web ölçekli metin korpuslarının çoğu **Common Crawl** ile başlar — 2008'den beri kamuya açık webi tarayan bir kâr amacı gütmeyen kuruluş. Her ay milyarlarca sayfa yakalar. Nisan 2024'ten tek bir tarama, yaklaşık **2,7 milyar web sayfası** ve yaklaşık **386 TiB sıkıştırılmamış HTML** içeriyordu. Bu, araştırmacıların istediği anlamda bir veri kümesi değil; ham cevher.

Ham Common Crawl bir karmaşa. HTML şablonu gerçek düzyazıyı bastırır. Navigasyon menüleri her sayfada tekrarlanır. Spam, dolandırıcılık, makine çevirisi çöp, yapay zekâ üretimi balçık ve sonsuz kopyalar var. Doğrudan üzerinde eğitim yaparsanız, modeliniz pop-up'lardan ve çerez bildirimlerinden dil öğrenmekten bekleyeceğiniz şekilde garip olur.

Modern veri hattı çıkarmayla başlar. HTML'i sıyır. Ana metni belirle. Dili tespit et. Şablonu çıkar. Çok az alfabetik içerikli, çok fazla tekrarlı, çok fazla şüpheli token'lı sayfaları at. Sonra tekilleştir.

Tekilleştirme tüm alandaki en gösterişsiz ve en sonuç doğuran adımlardan biri. Tam tekilleştirme bayt-özdeş kopyaları kaldırır. Yakın tekilleştirme, genellikle **MinHash** ya da yerel-duyarlı kırma ile, aynı olmayan ama aslında bin sitede yansıtılmış aynı makale olan sayfaları kaldırır. Bu neden önemli? Çünkü kopyalar modelin aynı söylentiyi 500 kez duymasının eşdeğeri gibi davranır. Tahmini dağılımı bozar, ezberlemeyi teşvik eder ve ölçüt soruları eğitimde birebir göründüğünde değerlendirmeleri kirletir.

## C4, WebText ve "Temizlenmiş Web" Korpuslarının İlk Nesli

İki etkili erken reçete, alanın web çöpünü model gıdasına nasıl dönüştürdüğünü gösterir.

OpenAI'ın GPT-2 için kullandığı **WebText**, **en az 3 karma alan Reddit gönderilerinden yaklaşık 45 milyon dış bağlantıdan** inşa edildi. Neredeyse gülünç derecede geçici gibi görünüyor ve bir anlamda öyleydi. Ama önemli bir sezgiyi yakalıyordu: kalite filtresi olarak insan dikkatini kullan.

Google'ın **C4** — Devasa Temiz Taranmış Korpus — T5'in arkasındaki veri kümesiydi. Tek bir Common Crawl anlık görüntüsünden türetildi ve sayma yöntemine bağlı olarak yaklaşık **156-172 milyar GPT-2 token'ına** ulaştı. C4'ün temizleme kuralları meşhur oldu: İngilizce olmayan sayfaları kaldır, şablonu sıyır, "kötü kelimeleri" filtrele, garip noktalama oranlarına sahip belgeleri at, vb.

Ve burada alan ilk büyük sosyoteknik çukurlarından birine çarptı. 2021'de araştırmacılar C4'ü denetledi ve toksik içeriği filtrelemesi gereken kara listelerin aynı zamanda marjinalleştirilmiş gruplar hakkındaki metinleri ve azınlık lehçelerinde yazılmış metinleri orantısız biçimde kaldırdığını gösterdi. "Hakaret içeren sayfaları bırak" gibi 2'de Jupyter not defterinde mantıklı görünen bir temizleme kuralı sessizce yeniden sahiplenilmiş dili, queer söylemi ve ırkçılık tartışmalarını silebilir. Sözde tarafsız bir filtre kültürel editör olur.

Bu tüm alan için uyarı ateşiydi. Her veri kümesi aynı zamanda "iyi dil" olarak neyin sayılacağına dair bir teoridir.

## The Pile: Mühendislik Stratejisi Olarak Derlenmiş Çeşitlilik

Common Crawl ham okyanus suyuysa, **The Pile** mineral dengeli bir karışım şişeleme girişimiydi. EleutherAI tarafından 2020'de yayınlanan The Pile, **22 bileşeni** **825 GiB**'lik İngilizce korpusta birleştirdi. Bileşenleri arasında PubMed makaleleri, arXiv, GitHub, Stack Exchange, Project Gutenberg, OpenSubtitles, patentler, Wikipedia ve tartışmalı bir bileşen olan **Books3** vardı.

The Pile'ın ardındaki önemli fikir sadece boyut değildi. **Karışım tasarımıydı.** Web metni genişlik verir, ama derlenmiş alanlar derinlik verir. Bilimsel makaleler teknik sözdizimi ve atıf stili öğretir. Kod biçimsel yapı öğretir. Kitaplar uzun menzilli anlatı öğretir. Soru-cevap siteleri öğretici açıklama öğretir. Alanları karıştırmak modellerin genellemesine yardımcı olur çünkü dil tek bir şey değildir; birçok örtüşen kullanım biçimidir.

## Kirli Sır: En İyi Verinin Bir Kısmı Yasal ve Etik Olarak Radyoaktif

Öncü model eğitim verisinin bu kadar gizli olmasının bir nedeni, dünyadaki en yüksek değerli metnin bir kısmının yasal gri bölgelerde oturması.

**Books3**'ü ele alın — The Pile'a katlanmış yaklaşık **37 GB**'lık korsan kitap korpusu. Kitaplar inanılmaz değerli eğitim materyali. Tutarlı uzun biçimli yapı, cilalanmış düzenleme, nadir sözlük ve yüzlerce sayfa boyunca sürdürülen argüman içerirler. Ama bu kitapların çoğu telif haklıydı. Bu gerçek artık Meta, OpenAI, Anthropic ve diğerlerine karşı davalara yansımış durumda.

Alanın gerçek kirli sırrı şu: web muazzam miktarda yararlı metin içerir, ama yararlılık ve meşruiyet aynı şey değil. En yüksek sinyalli korpuslar genellikle en karmaşık telif hakkı, rıza ya da köken hikâyesine sahip olanlardır.

## RefinedWeb, FineWeb ve Veri-Merkezli LLM Biliminin Yükselişi

2023 civarında araştırmacılar şaşırtıcı derecede radikal bir şeyi kanıtlamaya başladı: yeterince iyi filtrelemeyle, **tek başına web verisi** elle derlenmiş korpusları geçebilirdi.

En güçlü erken ifade, Abu Dabi'deki Teknoloji İnovasyon Enstitüsü'ndeki araştırmacıların liderliğinde Falcon'un arkasındaki **RefinedWeb** çalışmasından geldi. Agresif filtreleme ve tekilleştirme sonrası Common Crawl'ın hâlâ yaklaşık **5 trilyon token** yüksek kaliteli metin verdiğini savundular.

Sonra 2024'te Hugging Face'ten **FineWeb** geldi — **96 Common Crawl anlık görüntüsü** kullanarak yaklaşık **15 trilyon token** ölçeğinde açıkça erişilebilir bir korpus. FineWeb-Edu, eğitimsel olarak yoğun metni tanımlamak için sınıflandırıcılar eğiterek bir adım daha ileri gitti.

Çarpıcı bir DCLM sonucu: **280 milyar özenle seçilmiş token üzerinde eğitilmiş 7B model**, yaklaşık **7 kat daha az hesaplama** kullanarak MMLU'da **Llama 2 7B**'yi geçebildi.

Bu derin bir kayma. Yıllarca alan mimari-merkezliydi. DCLM ve ilgili çalışmalar, veri küratörlüğünün algoritmik ilerleme gibi görünen şeyi satın alabildiğini açıkça ortaya koydu.

Başka bir deyişle: hesaplama para ise, veri kalitesi döviz kurudur.

## Tekilleştirme, Filtreleme ve Karışım Tasarımı Neden Model Davranışını Değiştirir

Eğitimi bir olasılık dağılımı yontmak olarak düşünün. Her token şekli biraz iter. Şablonu milyonlarca kez tekrarlarsanız, heykeli bir yönde düzleştirirsiniz. Kitap, kod ve bilim makalesi karıştırırsanız başka boyutlar oyarsınız.

Üç kaldıraç en çok önem taşır:

### 1. Tekilleştirme
Tekilleştirme olmadan web uzlaşma hakkında yalan söyler. Sendikasyon haber ajansı haberleri, yansıtılmış blog gönderileri, kopyalanmış kopyalar ve şablonlu SEO sayfaları bilgi değerlerinin haklı gösterebileceğinden çok daha sık görünür.

### 2. Kalite Filtreleme
Noktalama oranları, şaşkınlık puanlama, dil kimliği, satır tekrarı ve sınıflandırıcı tabanlı puanlama gibi sezgisel kurallar "insana yararlı" metni çöpten ayırmaya çalışır. Giderek artan biçimde laboratuvarlar, daha büyük model görmeden önce belgeleri puanlamak için **küçük kalite modelleri** kullanır.

### 3. Karışım Ağırlıklandırma
Korpus sadece bir yığın değil; bir reçete. Meta, **Llama 3**'ün yaklaşık **15 trilyon token** üzerinde, yaklaşık **30 dilde %5'ten fazla İngilizce dışı veri** ve **Llama 2'den 4 kat fazla kod** ile eğitildiğini söyledi. Bu karışım seçimleri kozmetik değil. Daha fazla kod biçimsel sözdizimi ve araç kullanımı üzerinde muhakemeyi iyileştirir. Daha fazla çok dilli veri kapsamı genişletir ama İngilizce kapasiteyle rekabet eder.

## Kontaminasyon, Sentetik Balçık ve Yaklaşan Veri Duvarı

Eğitim verisinin başka bir problemi var: kontamine olmamış internet tükeniyor.

Ölçütler eğitim setlerine sızıyor. Model tarafından üretilmiş metin artık webi basıyor. SEO çiftlikleri insanları bilgilendirmek değil, arama trafiği çekmek amacıyla sayfalar oluşturmak için yapay zekâ kullanıyor. Bu, gelecek modellerin önceki modellerin düşük kaliteli çıktılarından öğrenme riski taşıdığı anlamına gelir — her yırtıcının kendi atığının işlenmiş versiyonlarını yemeye başladığı bir ekosistem gibi.

Araştırmacılar buna bazen **model çöküşü** der, gerçek dünya karışımları için yıkıcı versiyonlar muhtemelen abartılmış olsa da. Yine de tehlike, laboratuvarların şüpheli sentetik metni agresif biçimde filtrelemesi ve yüksek güven kaynaklarını koruması için yeterince gerçek.

Veri duvarı sonraki ölçekleme duvarı olabilir.

## En İyi Laboratuvarlar Neden Kökenle Takıntılı Hale Geldi

Bugün bir öncü eğitim korpusu veri kümesinden çok tedarik zincirine benzer. Laboratuvarlar köken, lisanslama, tekilleştirme soy ağacı, çıkış listeleri, ölçüt örtüşmesi, alan ağırlıkları ve sonradan denetimleri izler. Bunu kısmen etik, kısmen davalar, kısmen halkla ilişkiler için yaparlar — ama aynı zamanda köken teknik olarak da yararlıdır.

Modern LLM altyapısının gösterişsiz bir çekirdek gerçeği var: yapay zekânın geleceği yeni bir transformer bloğu keşfetmekten çok daha iyi veri rafinerileri inşa etmeye bağlı olabilir.

---

LLM söyleminin ilk nesli veriyi yakıt olarak ele aldı. Ortaya çıkan görüş verinin daha çok yetiştirme gibi olduğu. Benzer parametre sayıları ve hesaplama bütçelerine sahip iki model, biri tekilleştirilmiş eğitim metni üzerinde, diğeri kopyalanmış tekrarlar bataklığında yetiştirilmişse, fark edilir biçimde farklı "zihinler" olabilir.

*Yarın ön eğitim korpuslarından modern LLM çağının sonraki büyük numarasına geçiyoruz: **ince ayar ve transfer öğrenme** — genel amaçlı bir temel modelin şaşırtıcı derecede az ek veriyle bir kodcuya, sohbet asistanına, hukuki özetleyiciye ya da tıbbi yardımcıya nasıl dönüştüğü.*

---

<div style="margin-top: 2em; padding: 1.5em; background: #1a1a2e; border-radius: 8px; border: 1px solid #16213e;">

## 📝 Quiz — Gün 9

Bugünkü dersten ne öğrendiğinizi test edin.

<a href="quizzes/day-09.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 9 Quizini Çöz →</a>

</div>
