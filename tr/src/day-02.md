# Gün 2: Kelime Gömmeleri — Anlamın Geometrisi

*Basit bir numara — kelimeleri sayı listelerine dönüştürmek — dilin gizli bir geometrik yapısı olduğunu ortaya çıkardı ve "kral eksi erkek artı kadın eşittir kraliçe" her şeyi değiştirdi.*

---

## NLP'yi Neredeyse Öldüren Problem

Dün bir merak noktasında bırakmıştık: n-gram modelleri genelleme yapamıyordu. "Kedi minder üzerinde oturdu"yu bin kez görmüş ama "tekir kilim üzerinde dinlendi"yi hiç görmemişlerse, ikinci cümleyi özünde yepyeni bir şey olarak ele alıyorlardı. Model, "tekir"in bir kedi türü olduğunu ya da "dinlendi"nin "oturdu"ya benzediğini *bilmiyordu*. Her kelime opak bir sembol, diğer tüm kelimelerden bir seri numaranın sahibinden ilişkisiz olduğu kadar bağımsızdı.

Makine öğrenmesi dilinde, kelimeler **tek-sıcak (one-hot) vektörler** olarak temsil ediliyordu: sözlüğünüz 50.000 kelimeyse, "kedi" kelimesi 7.291. konumunda tek bir 1 ve geri kalan 50.000 sıfırdan oluşan bir vektör olabilir. "Köpek" ise 12.408. konumunda 1 bulunan bir sıfır dizisi olurdu. Matematiksel olarak, "kedi" ile "köpek" arasındaki mesafe, "kedi" ile "termonükleer" arasındaki mesafeyle birebir aynıdır. Her kelime diğer her kelimeden eşit uzaklıktadır. Bu sadece yararsız değil — aktif olarak yanlış.

Bu temsil pratik bir lanet de taşıyor: devasa ve seyrek. 100.000 kelimelik bir sözlük, her kelimenin %99,999'u sıfır olan 100.000 boyutlu bir vektör olması demek. Bununla bir sinir ağı eğitmeyi deneyin. Parametreler patlar, gradyanlar söner ve modelin kapasitesinin çoğu neredeyse hiç aktif olmayan boyutlara harcanır.

Her şeyi değiştiren kavrayış yanıltıcı biçimde basitti: **ya her kelimeyi kısa, yoğun bir vektör — diyelim 300 sayı — olarak temsil etsek ve benzer kelimelerin benzer vektörleri olsa?** 100.000 boyutlu bir sıfır çölü yerine, her kelime 300 boyutlu bir uzayda kompakt bir nokta olur. Ve kritik olarak, bu uzaydaki konumlar elle atanmak yerine *veriden öğrenilir*.

İşte **kelime gömmelerinin** ardındaki temel fikir bu — ve abartısız söylemek gerekirse, doğal dil işleme tarihindeki en önemli temsilsel yeniliktir.

## Dağılımsal Hipotez: Çevrendekilerle Tanınırsın

Kelime gömmelerinin teorik omurgası **dağılımsal hipotez**tir. En özlü haliyle 1957'de İngiliz dilbilimci J.R. Firth şöyle ifade etmiştir: *"Bir kelimeyi, yanında bulunduğu kelimelerden tanırsın."*

Fikir şu: benzer bağlamlarda geçen kelimeler benzer anlamlara sahip olma eğilimindedir. "Köpek" ve "kedi" yanlarında "evcil hayvan," "beslemek," "veteriner" ve "tatlı" gibi kelimelerle birlikte geçer. "Plütonyum" ve "uranyum" ise "reaktör," "zenginleştirme" ve "izotop" yakınında bulunur. "Köpek" ve "kedi"nin ilişkili olduğunu anlamak için sözlüğe ihtiyacınız yok — milyonlarca cümle boyunca etraflarındaki kelimelere bakmanız yeterli.

Bu sadece dilbilimsel bir folklor değil. Deneysel olarak test edilebilir ve şaşırtıcı derecede sağlam. 1990'larda Bell Labs ve başka yerlerdeki araştırmacılar, tamamen dağılımsal yöntemlerin kelimeleri anlamlı gruplar halinde kümeleyebildiğini gösterdi — isimleri isimlerle, fiilleri fiillerle, ülkeleri ülkelerle — hiç etiketli veri kullanmadan. Dilin istatistiksel yapısı, gözler önünde gizlenerek, muazzam miktarda anlamsal bilgi kodluyor.

Ama bu kavrayışı pratik, eğitilebilir bir sisteme dönüştürmek? Bu birkaç on yıl daha ve Google'daki bir ekibin kritik katkısını gerektirdi.

## Word2Vec: Bin Startup Doğuran Makale

2013'te Google'daki Tomáš Mikolov ve meslektaşları, NLP topluluğunda şok dalgaları yaratan bir çift makale yayınladı. Sistem **Word2Vec** adını taşıyordu ve dehası fikirde değildi — Bengio 2003'te sinirsel dil modellerinin kelime temsilleri öğrenebildiğini zaten göstermişti — *mühendisliğindeydi*. Word2Vec, kelime gömmelerini tek bir makinede *saatler* içinde *milyarlarca* kelime üzerinde eğitmeyi mümkün kıldı.

Word2Vec iki çeşit gelir:

### Sürekli Kelime Çantası (CBOW)

Bir bağlam kelime penceresi verildiğinde (diyelim her iki yanda 5 kelime), ortadaki kelimeyi tahmin et. Bağlam "kedi ___ üzerinde oturdu" ise model "minder"i tahmin etmeli. Milyarlarca kez oynanan bir boşluk doldurma oyunu gibi.

### Skip-gram

Tersi: ortadaki kelime verildiğinde, bağlam kelimelerini tahmin et. "Kedi" verildiğinde, "minder," "üzerinde," "oturdu"nun yakınlarda geçmesinin muhtemel olduğunu tahmin et. Daha zor gibi görünüyor ve öyle de — ama skip-gram nadir kelimeler için daha iyi gömmeler üretiyor, çünkü her eğitim örneği birden fazla tahmin üretiyor.

Her iki mimari de çarpıcı biçimde basit. "Sinir ağı" ancak sinir ağı sayılır — girdi ve çıktı arasına sıkıştırılmış tek bir gizli katman. Aktivasyon fonksiyonu yok, derin yığınlama yok, konvolüsyon yok. Sadece bir arama tablosu (gömme matrisi) ve doğrusal bir izdüşüm. Modelin tamamı iki matristen oluşur: **W** (sözlük boyutu × gömme boyutu) ve **W'** (gömme boyutu × sözlük boyutu). 300 boyutlu gömmelerle 100.000 kelimelik bir sözlük için bu 60 milyon parametre yapar. GPT-4'ün tahminen 1,8 *trilyonu* var. Word2Vec, tek bir transformer katmanından üç büyüklük sırası daha küçük.

Asıl numara, matematiği çözülebilir kılan bir eğitim kısayolu olan **negatif örnekleme**ydi. Tüm 100.000 sözlük kelimesi üzerinde bir olasılık dağılımı hesaplamak (felaket derecede pahalı bir softmax gerektirir) yerine, negatif örnekleme problemi yeniden formüle eder: her gerçek (kelime, bağlam) çifti için 5-15 rastgele "negatif" kelime örnekle ve modeli gerçek birlikte geçişleri sahte olanlardan ayırt etmek üzere eğit. Bu, 100.000 yollu bir sınıflandırmayı bir avuç ikili karara dönüştürerek eğitim süresini büyüklük sıraları kadar kısaltır.

Mikolov, Word2Vec'i Google News'tan 6 milyar token üzerinde tek bir makinede bir günden kısa sürede eğitti. Ortaya çıkan gömmeler NLP tarihinin en çok indirilen üretimi oldu — ve kimsenin beklemediği bir şey ortaya çıkardı.

## Kral − Erkek + Kadın = Kraliçe: Anlam Uzayında Aritmetik

İşte kelime gömmelerini meşhur eden an. "Kral"ın 300 boyutlu vektörünü alın. "Erkek"in vektörünü çıkarın. "Kadın"ın vektörünü ekleyin. Ortaya çıkan vektöre en yakın kelime? **"Kraliçe."**

Bu programlanmamıştı. Kimse modele cinsiyet ya da kraliyet ailesi hakkında bir şey söylememişti. Tamamen kelime birlikte geçiş istatistiklerinden ortaya çıktı. Ve onlarca ilişki için işe yaradı:

- **Paris − Fransa + İtalya ≈ Roma** (başkentler)
- **daha büyük − büyük + küçük ≈ daha küçük** (karşılaştırma formları)
- **yürüyor − yürüdü + yüzdü ≈ yüzüyor** (zaman değişimleri)
- **Einstein − bilim insanı + ressam ≈ Picasso** (meslek transferi)

Burada ne oluyor? Gömme uzayı kendini, kelime çiftleri arasındaki tutarlı ilişkilerin tutarlı *yönler* olarak kodlandığı şekilde organize etmiş. "Cinsiyet" yönü (erkek → kadın, kral → kraliçe, amca → teyze) uzayın her yerinde kabaca aynı vektör. "Başkent" yönü (Fransa → Paris, İtalya → Roma, Japonya → Tokyo) başka bir tutarlı vektör. Model, kelime birlikte geçiş istatistiklerinden başka hiçbir şey kullanmadan, dilin gizli bir **doğrusal yapısı** olduğunu keşfetmiş.

Bu, dilbilimcileri ve yapay zekâ araştırmacılarını gerçekten şok etti. Dilin karmaşık, belirsiz, bağlama bağımlı olması gerekiyor. Ama işte burada, kristal kafes gibi düzgün geometrik ilişkilerle sergileniyordu. Stanford NLP grubundan Christopher Manning'in dediği gibi: "En şaşırtıcı olan, bu temsillerin bu kadar doğrusal olmasıydı."

### Analoji Görevinin Kirli Sırrı

Sezgiye aykırı kısım şu: bu analojiler, çoğu popüler anlatımın ileri sürdüğünden *daha az iyi* çalışır. Mikolov'un 19.544 analoji sorusu üzerindeki orijinal değerlendirmesinde, Word2Vec sözdizimsel analojilerde (fiil zamanları, çoğullar) yaklaşık %74, anlamsal analojilerde (başkentler, para birimleri) ise yalnızca yaklaşık %64 doğru cevap verdi. Sonraki çalışmalar, analoji yönteminin yanlı olduğunu gösterdi — paralelkenar ilişkisini gerçekten karşılayan kelimeler yerine, üç girdi kelimesinin hepsine ayrı ayrı yakın kelimeleri döndürme eğiliminde. Ve bazı "analojiler" eğitim verisine gömülmüş rahatsız edici toplumsal önyargıları yansıtıyordu: **erkek : bilgisayar programcısı :: kadın : ev kadını** Google News üzerinde eğitilmiş gömmelerden elde edilen gerçek bir sonuçtu.

Bu önyargılar algoritmadaki hatalar değil — metindeki istatistiksel örüntülerin sadık yansımaları. Bu da hâlâ tam olarak çözülmemiş bir soruyu gündeme getiriyor: gömmeleriniz doktorların erkek, hemşirelerin kadın olduğunu kodluyorsa (çünkü eğitim korpusunuzdaki istatistiksel dağılım bu), ve siz bu gömmeleri bir işe alım sisteminde kullanıyorsanız, ayrımcılığı otomatikleştirmiş olursunuz. Tolga Bolukbasi ve meslektaşları 2016'da çığır açıcı bir makale yayınladı — "Man is to Computer Programmer as Woman is to Homemaker? Debiasing Word Embeddings" — bu önyargıları kapsamlı biçimde belgeledi ve geometrik önyargı giderme yöntemleri önerdi — ama dilin *kendisinin* önyargılı olduğuna dair daha derin problem hâlâ duruyor.

> 💡 **Önyargı neden önemli?** Kelime gömmeleri sadece akademik bir merak değil — arama motorlarından işe alım sistemlerine, kredi puanlamasından hukuki karar destek araçlarına kadar pek çok yerde kullanılıyor. Gömmelerdeki önyargı, gerçek insanların hayatını etkileyen kararlara sızabilir.

## GloVe: Sayımlar Gradyanlarla Buluşuyor

2014'e ileri sarın. Stanford'dan Jeffrey Pennington, Richard Socher ve Christopher Manning, aynı hedefe felsefi açıdan farklı bir yaklaşımla gelen **GloVe**'u (Kelime Temsili için Global Vektörler) yayınladı.

Word2Vec *tahminsel* bir modeldir: bağlamdan kelimeleri tahmin etmeye çalışarak gömmeleri öğrenir. GloVe ise global kelime-kelime birlikte geçiş matrisiyle — tüm korpus boyunca i kelimesinin j kelimesinin yanında ne sıklıkla göründüğünü kaydeden devasa bir tablo — başlayan ve bunu çarpanlara ayıran *sayım tabanlı* bir modeldir.

GloVe'un ardındaki kilit kavrayış, birlikte geçiş olasılıklarının *oranlarının* anlamı, ham olasılıklardan daha güvenilir biçimde kodladığıdır. Üç kelimeyi düşünün: "buz," "buhar" ve "katı." "Katı"nın "buz" yanında geçme olasılığı yüksektir (P ≈ 1,9 × 10⁻⁴), "buhar" yanında geçme olasılığı ise düşüktür (P ≈ 2,2 × 10⁻⁵). P(katı|buz)/P(katı|buhar) ≈ 8,9 oranı — büyük bir sayı, "katı"nın "buhar"dan çok daha fazla "buz"la ilişkili olduğunu söylüyor. "Gaz" kelimesi için oran tersine döner: P(gaz|buz)/P(gaz|buhar) ≈ 0,085. "Su" gibi tarafsız bir kelime için oran 1'e yakındır.

GloVe, iki kelime vektörünün iç çarpımının birlikte geçiş sayılarının logaritmasına yaklaşması için gömmeler eğitir:

> **wᵢ · wⱼ + bᵢ + bⱼ ≈ log(Xᵢⱼ)**

Bu zarif ve temiz bir hedeftir. Model sadece ağırlıklı en küçük kareler regresyonu — sinir ağı yok, diziler üzerinde geri yayılım yok, negatif örnekleme yok. GloVe'u 6 milyar token (Wikipedia + Gigaword) üzerinde 300 boyutlu vektörlerle eğitmek 8 CPU'da yaklaşık 4 saat sürdü.

Pratikte GloVe ve Word2Vec karşılaştırılabilir kalitede gömmeler üretir. WordSim-353 ve SimLex-999 gibi kelime benzerliği ölçütlerinde ikisi tipik olarak birkaç yüzdelik puan farkıyla puan alır. GloVe analoji görevlerinde hafif üstünlük sağlar; Word2Vec alt görev NLP görevlerinde daha iyi olma eğilimindedir. GloVe'un asıl katkısı teorikti: tahminsel (Word2Vec) ve sayım tabanlı (klasik dağılımsal anlambilim) yaklaşımların temelden farklı olmadığını gösterdi. Aynı dağın iki yolu.

## Boyutluluk Sorusu: Neden 300?

Kelime gömmeleri neden tipik olarak 200-300 boyuta sahip? Neden 50 değil, 10.000 değil?

Pratik bir cevap ve derin bir cevap var. Pratik cevap deneyseldir: Mikolov 50'den 1.000'e boyutları test etti ve analoji görevlerindeki performansın yaklaşık 300 boyuta kadar dik biçimde arttığını, sonra plato yaptığını buldu. Daha fazla boyut daha fazla parametre, daha uzun eğitim ve azalan getiri demek.

Derin cevap dilin **iç boyutsallığıyla** ilgili. Anlamın gerçekten kaç bağımsız varyasyon ekseni var? Cinsiyet, canlılık, boyut, resmiyyet, duygu, somutluk, alan (tıbbi vs. hukuki vs. günlük), zaman dilimi ve yüzlerce daha ince ayrım için boyutlara ihtiyacınız var. Araştırmacılar, İngilizce kelime anlamının iç boyutsallığını yönteme bağlı olarak 200 ile 500 arasında tahmin etti. Bunun altında çok fazla sıkıştırıyorsunuz ve ayrımları kaybediyorsunuz. Üstünde ise gürültüye uyum sağlıyorsunuz.

Burada **rastgele matris teorisiyle** şaşırtıcı derecede temiz bir ilişki var. Birlikte geçiş matrisini alıp özdeğerlerini hesaplarsanız, rank 200-400 civarında keskin bir dirsek görürsünüz — bunun altında özdeğerler gerçek anlamsal yapıyı temsil eder; üstünde gürültüden ayırt edilemezler. Ampirik olarak en iyi çalışan 300 boyutun, doğal dilde sinyalin gürültüyle buluştuğu rank olduğu ortaya çıkıyor.

## FastText: Tam Kelimelerin Ötesinde

Word2Vec ve GloVe'un göze batan bir sınırı: her kelimeyi atomik bir birim olarak ele alırlar. "Mutsuzluk" kelimesi kendi vektörünü alır, "mutsuz," "mutluluk" ya da "mutlu"dan tamamen bağımsız. Türkçe, Fince ya da Arapça gibi morfolojik açıdan zengin diller için — tek bir kökten binlerce çekimli form üretilebilir — bu felaket niteliğindedir. Çoğu kelime formu iyi gömmeler öğrenmeye yetecek kadar nadir görülür, eğer görülürse.

> 💡 **Türkçe neden özel?** Türkçe sondan eklemeli (aglütinatif) bir dildir. "Evlerinizden" kelimesi tek başına "from your houses" anlamına gelir. Bir kök, yüzlerce farklı ek kombinasyonuyla binlerce forma dönüşebilir. Bu, sabit sözlüklü modeller için ciddi bir zorluktur.

2017'de Facebook AI Research'ten (şimdi Meta AI) Piotr Bojanowski ve meslektaşları, skip-gram modelini **karakter n-gramları** üzerinde çalışacak şekilde genişleten **FastText**'i yayınladı. "Mutsuzluk"u tek bir vektör olarak temsil etmek yerine, FastText onu karakter dizilerine ayırır: "<mu", "mut", "uts", "tsu", "suz", "uzl", "zlu", "luk", "uk>" (n=3 için). Kelimenin gömmesi, karakter n-gram gömmelerinin toplamıdır.

Bu üç nedenle zariftir. Birincisi, morfolojik olarak ilişkili kelimeler otomatik olarak temsil paylaşır: "mutlu," "mutsuz," "mutluluk" ve "mutluca"nın hepsi "mut" n-gramını içerir. İkincisi, FastText hiç görmediği kelimeler için vektör üretebilir — karakter n-gram vektörlerini toplayarak herhangi bir dize için, yazım hatası ya da yeni kelime bile olsa, makul bir gömme elde edersiniz. Üçüncüsü, morfolojik açıdan karmaşık dillerde olağanüstü iyi çalışır. Türkçe kelime benzerliği görevlerinde FastText, Word2Vec'i %15-20 oranında geçmiştir.

Facebook, 157 dil için önceden eğitilmiş FastText vektörleri yayınladı — hâlâ var olan en yaygın kullanılan çok dilli NLP kaynaklarından biri.

## Gömmelerin Yapamadığı: Çokanlamlılık Problemi

İşte bu kursun geri kalanında inceleyeceğimiz her şeyi motive eden, sezgiye aykırı sınırlama: **statik kelime gömmeleri bağlamdan bağımsız olarak her kelimeye tam olarak bir vektör verir**. "Yüz" kelimesi, insan yüzü anlamı ile sayı yüz anlamının bir tür ortalaması olan tek bir vektör alır. "Kol" hem vücut uzvu hem de koltuk kolu anlamını bulandırır.

Bu küçük bir sıkıntı gibi görünüyor ama aslında temel bir sorun. 2019'da Camacho-Collados ve Pilehvar tarafından yapılan bir analiz, yaygın İngilizce kelimelerin yaklaşık %7,8'inin belirgin biçimde çokanlamlı olduğunu buldu — ve bu kelimeler *en sık kullanılan* kelimeler olma eğiliminde. İngilizce "set" kelimesinin Oxford Sözlüğü'nde 430 anlamı var. "Run" kelimesinin 645 tanımı. Bunlar en sık karşılaştığınız kelimeler ve tam olarak statik gömmelerin en kötü idare ettiği kelimeler.

Çeşitli araştırmacılar bunu kelime başına *birden fazla* vektör öğrenerek düzeltmeye çalıştı (Huang ve ark., 2012, "anlam" başına bir vektör öğrendi), ama bu yaklaşımlar hantal kaldı ve hiçbir zaman yaygınlaşmadı. Gerçek çözüm tamamen farklı bir yönden geldi: bir kelimenin temsilinin içinde bulunduğu cümleye göre değiştiği **bağlamsallaştırılmış gömmeler**. ELMo (2018) ilk başarılı versiyondu, ardından BERT ve GPT geldi — önümüzdeki günlerde bunlara değineceğiz.

## Miras: Gömmeler Neden Hâlâ Önemli

Kelime gömmelerinin eskidiğini — transformer öncesi çağdan şirin kalıntılar olduğunu — düşünebilirsiniz. Yanılırsınız. GPT-4'ten Claude'a, Gemini'ye kadar her modern dil modeli, token'ları bir **gömme katmanı** aracılığıyla yoğun vektörlere dönüştürerek başlar. Bir transformer'ın yaptığı ilk şey, herhangi bir dikkat ya da ileri beslemeli hesaplamadan önce, her girdi token'ı için öğrenilmiş bir vektör aramaktır. GPT-3'ün gömme katmanı 50.257 token kimliğini 12.288 boyutlu vektörlere eşler — bu sadece gömmeler için 618 milyon parametre, kabaca BERT-Large'ın toplam parametre sayısına eşit.

Fark şu ki bir transformer'da gömme sadece başlangıç noktası. Bu ilk vektörler, düzinelerce ya da yüzlerce dikkat ve hesaplama katmanı tarafından dönüştürülerek her cümleyle değişen **bağlamsallaştırılmış** temsiller üretir. Ama temel kavrayış — ayrık sembollerin yoğun vektör temsillerini öğrenebileceğiniz ve ortaya çıkan uzayın geometrisinin anlamı kodladığı — doğrudan Word2Vec'ten gelir.

Çok gerçek bir anlamda, Mikolov'un 2013 makaleleri tüm modern LLM ekosisteminin filizlendiği tohumu ekti. Anlamın geometrisi olduğu, kavramlar arasındaki ilişkilerin vektör uzayında yönler olduğu, fikirlerle aritmetik yapılabileceği fikri — geri kalan her şeyin üzerine inşa edildiği temel budur.

---

*Yarın, transformer'ları mümkün kılan mekanizmayı keşfedeceğiz: **dikkat**. Bir model, bir cümledeki hangi kelimelerin diğer her kelimeyi anlamak için en önemli olduğuna nasıl karar verir? Cevap, şaşırtıcı derecede basit bir işlem olan — sorgular, anahtarlar ve değerler — on yılın en önemli mimari yeniliği olduğu ortaya çıkan bu mekanizmayı içerir. "Attention Is All You Need"in neden sadece akılda kalıcı bir makale başlığı olmadığını görmeye hazır olun.*

---

## Anlayışınızı Test Edin

Öğrendiklerinizi kontrol etmeye hazır mısınız? Gün 2 quizini çözün:

<div id="quiz-day-02"></div>
<script src="../quiz/quiz-embed.iife.js"></script>
<link rel="stylesheet" href="../quiz/style.css">
<script>
QuizEmbed.createQuiz("quiz-day-02", "/quizzes/day-02.toml");
</script>
