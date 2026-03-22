# Gün 5: Tokenizasyon — BPE, SentencePiece ve Neden "Token" ≠ "Kelime"

*Gömmeleri, dikkati ve Transformer mimarisini öğrendiniz. Ama tüm bunların altında gizlenen küçük kirli bir sır var: model kelimeleri görmez. Token'ları görür — ve metni token'lara nasıl böldüğünüz, modelin ne yapabileceği, çalıştırmanın ne kadara mal olacağı ve dilinizi idare edip edemeyeceği konusunda her şeyi değiştirir.*

---

## Kimsenin Konuşmadığı Problem

Bir düşünce deneyi. GPT-4 inşa ediyorsunuz. 13 trilyon token'lık eğitim verisi topladınız, yüz milyarlarca parametreli bir mimari tasarladınız ve 100 milyon doların üzerinde hesaplama harcamak üzeresiniz. Bunların hiçbiri olmadan önce, tüm hattaki en gösterişsiz kararla yüz yüze geliyorsunuz: **ham metni sayılara nasıl dönüştürürsünüz?**

Bu tokenizasyondur — insan tarafından okunabilir metni bir sinir ağının işleyebileceği tam sayı kimliklerinden oluşan bir diziye dönüştürme süreci. Sıkıcı görünüyor. Çözülmüş bir problem gibi, birinci gününde stajyerin hallettiği tesisat işi gibi. Aslında büyük dil modeli mühendisliğinin tamamındaki en sonuç doğuran tasarım kararlarından biri.

Tokenizer, bir modelin bir cümleyi okumak için kaç "adıma" ihtiyaç duyduğunu belirler, bu da çıkarım maliyetini doğrudan kontrol eder. Modelin kod, matematik, nadir diller ya da emojiyi idare edip edemeyeceğini belirler. Tuhaf hata modları yaratır — GPT-3.5 "strawberry" kelimesindeki harfleri güvenilir biçimde sayamıyordu çünkü tokenizer'ı bunu `['straw', 'berry']` olarak bölüyordu, model on karakter yerine iki token görüyordu. Ve derin bir adaletsizlik yaratır: aynı cümle bazı dillerde İngilizceden 2-10 kat daha fazla token'a mal olur, yani İngilizce konuşmayanlar aynı API'yi kullanmak için kelimenin tam anlamıyla daha fazla para öder.

Tokenizasyon, dilbilim, bilgi teorisi ve soğuk mühendislik ekonomisinin çarpıştığı yerdir. Düzgün anlayalım.

## Neden Sadece Karakter Kullanmayalım?

En naif yaklaşım: metni tek tek karakterlere bölün. İngilizcede kabaca 26 küçük harf, 26 büyük harf, 10 rakam ve biraz noktalama var — toplam belki 100 karakter. Sözlüğünüz minik ve zarif. Her kelime, ne kadar nadir olursa olsun, temsil edilebilir.

Sorun acımasız. "Transformer" kelimesi 11 karakter, yani modelin işlemek için 11 zaman adımına ihtiyacı var. 2.000 kelimelik bir makale 10.000+ karaktere dönüşebilir. Öz-dikkatin hesaplama maliyeti dizi uzunluğuyla karesel ölçeklendiğinden (ya da modern yaklaşımlarla en iyi ihtimalle doğrusal), her şeyi 3-5 kat daha pahalı hale getirdiniz. Ve modelin sıfırdan `t-r-a-n-s-f-o-r-m-e-r`'ın anlamlı bir birim olduğunu öğrenmesi gerekiyor. Karakter düzeyinde modeller var — bazı görevlerde çalışıyor — ama dil anlama için alt-kelime modellerinin hesaplama başına performansıyla hiçbir zaman eşleşemediler.

## Neden Sadece Kelime Kullanmayalım?

Karşıt uç: her kelimeyi tek bir token olarak ele alın. Boşluk ve noktalamadan bölün. Artık "transformer" bir token, bir zaman adımı. Verimli!

Ama yalnızca İngilizcede aktif kullanımda en az 170.000 kelime var (Oxford İngilizce Sözlüğü 600.000'den fazla tarihsel kayıt listeler). Bilimsel terminoloji, özel isimler, argo, yazım hataları, URL'ler, kod ve diğer dilleri ekleyin, milyonlarca sözlük kaydına ihtiyacınız var. Her token gömme matrisinde kendi satırını ve çıktı tahmin katmanında kendi sütununu alır. 4.096'lık bir gizli boyutla, her sözlük kaydı 4.096 × 2 = 8.192 parametreye mal olur (girdi gömmesi + çıktı izdüşümü). 1 milyon kelimelik bir sözlük, tek bir Transformer katmanından önce, sadece gömmeler için 8 milyar parametre yakardı.

Daha da kötüsü, kelime düzeyinde bir sözlük yeni kelimeleri idare edemez. Model "ChatGPT"yle ilk kez karşılaştığında ne yapar? Ya da "Geschwindigkeitsbegrenzung" (hız sınırı) gibi bir Almanca bileşik isimle? Ya da yanlış yazılmış "transformre" ile? Ya bilinmeyen her şeyi tek bir `<UNK>` token'ına eşler — tüm bilgiyi kaybeder — ya da tamamen başarısız olur.

Arada bir şeye ihtiyacınız var.

## Byte Pair Encoding: Zarif Sıkıştırma Numarası

Cevap beklenmedik bir yerden geldi: veri sıkıştırma. 1994'te Philip Gage, *C Users Journal*'da en sık rastlanan bayt çiftini yeni bir sembolle yinelemeli olarak değiştirerek veri sıkıştıran basit bir algoritma olan **Byte Pair Encoding (BPE)** hakkında kısa bir makale yayınladı. Yirmi iki yıl sonra Edinburgh Üniversitesi'nden Rico Sennrich, Barry Haddow ve Alexandra Birch bu fikrin makine çevirisi tokenizasyonunu devrimleştirebileceğini fark etti. 2016 tarihli "Neural Machine Translation of Rare Words with Subword Units" makaleleri NLP'nin en çok atıf alan çalışmalarından biri oldu.

BPE tokenizasyon için şöyle çalışır:

**Adım 1: Karakterlerle başla.** Başlangıç sözlüğünüz sadece 256 olası bayt (ya da uygulamaya bağlı olarak Unicode karakterler). Her kelime tamamen ayrıştırılır: `"düşük"` → `['d', 'ü', 'ş', 'ü', 'k']`.

**Adım 2: Çiftleri say.** Tüm eğitim korpusunu tarayın ve her bitişik sembol çiftinin ne sıklıkta göründüğünü sayın. Belki `('t', 'h')` 50 milyon kez görünürken `('q', 'z')` 12 kez görünür.

**Adım 3: En sık çifti birleştir.** `('t', 'h')`'ın her geçişini yeni bir `'th'` sembolüyle değiştirin. `'th'`'ı sözlüğe ekleyin.

**Adım 4: Tekrarla.** Çiftleri tekrar sayın (artık `'th'`'ı bir birim olarak dahil ederek), en sığını birleştirin, sözlüğe ekleyin. Hedef sözlük boyutuna ulaşana kadar devam edin.

50.000 birleştirmeden sonra 50.256 token'lık bir sözlüğünüz var (256 temel bayt + 50.000 birleştirme). "The" gibi yaygın kelimeler tek token. "ing", "tion", "pre" gibi yaygın alt kelimeler tek token. "Cryogenics" gibi nadir kelimeler `['cry', 'ogen', 'ics']` gibi parçalara bölünür — tek bir token kadar verimli değil ama bireysel karakterlerden çok daha iyi ve her parça anlamsal sinyal taşır.

BPE'nin güzelliği, eğittiğiniz her korpus için sıkıştırma-optimal bir sözlüğü otomatik olarak keşfetmesidir. Kod besleyin ve `def`, `return`, `function`, `import`ın tek token olması gerektiğini öğrenir. Tıbbi metin besleyin ve `cardio`, `pulmon`, `ectomy`'i öğrenir. Çok dilli veri besleyin ve diller arası ortak alt kelimeleri keşfeder.

> 💡 **Türkçe için bu neden önemli?** Türkçe gibi eklemeli dillerde bir kök kelime onlarca ek alabilir: "gidememişlerdir" tek bir kelimedir ama pek çok bilgi barındırır. İyi bir tokenizer bu ekleri anlamlı parçalar halinde bölebilmeli ki model Türkçenin morfolojik zenginliğini kavrayabilsin.

## GPT-2'nin Atılımı: Bayt Düzeyinde BPE

Orijinal Sennrich BPE Unicode karakterler üzerinde çalışıyordu, bu da nadir Unicode kod noktalarında sorunlar yaratıyordu. OpenAI'ın 2019'da yayınladığı GPT-2, **bayt düzeyinde BPE**'yi tanıttı: karakterlerden başlamak yerine 256 ham bayttan başlıyorsunuz. Her olası metin — İngilizce, Çince, Arapça, emoji, ikili veri — bir bayt dizisi olarak temsil edilebilir. Hiçbir metin asla `<UNK>` olmaz. Sözlük tam 256'dan başlar ve birleştirmeler oradan yukarı doğru inşa eder.

GPT-2 50.257 token'lık bir sözlük kullandı. GPT-3 aynı tokenizer'ı korudu. GPT-4 **cl100k_base**'e taşındı, 100.277 token'lık daha yeni bir BPE tokenizer — sözlüğü kabaca ikiye katlıyor. GPT-4o **o200k_base** ile yaklaşık 200.000 token'a daha da ileri gitti.

Neden artmaya devam ediyor? Daha büyük sözlükler metni daha agresif sıkıştırır. 50K sözlükle 15 token alan bir cümle, 200K sözlükle sadece 10 token alabilir. Çıkarım zamanında token başına ödeme yaptığınız ve dikkat maliyeti dizi uzunluğuyla ölçeklendiği için, daha büyük sözlükler operasyonel maliyetleri doğrudan azaltır. Karşılık olarak gömme matrisi büyür, ama yüz milyarlarca parametreli modeller için birkaç yüz milyon ek gömme parametresi önemsizdir — toplam modelin belki %0,1'i.

## SentencePiece: Dil Varsayımı Olmadan Tokenizasyon

OpenAI'ın (ve `tiktoken` kütüphanesinin) uyguladığı BPE bir **ön-tokenizasyon** adımına dayanır: BPE birleştirmeleri olmadan önce metin, kelime sınırlarını, sayıları ve boşlukları tanıyan regex kalıpları kullanılarak kaba parçalara bölünür. Bu ön-tokenizasyon bir tümevarımsal önyargı biçimidir — metnin boşluklarla ayrılmış kelime-benzeri birimlere sahip olduğunu varsayar.

Google'da Taku Kudo tarafından 2018'de geliştirilen **SentencePiece** daha radikal bir yaklaşım benimser: girdiyi hiç ön-tokenizasyon olmadan ham karakter (ya da bayt) akışı olarak ele alır. Boşluklar sadece başka bir karakter olarak işlenir — aslında SentencePiece boşlukları özel bir `▁` (Unicode U+2581) karakteriyle değiştirir, böylece token'ın görünür bir parçası olurlar. Bu, tokenizasyonu **tamamen tersine çevrilebilir** kılar: token dizisinden boşluklar dahil tam orijinal metni yeniden oluşturabilirsiniz.

SentencePiece iki algoritma uygular: BPE ve farklı çalışan olasılıksal bir alternatif olan **Unigram**. BPE sözlüğü aşağıdan yukarı birleştirerek inşa ederken, Unigram yukarıdan aşağı çalışır: devasa bir başlangıç sözlüğüyle (diyelim milyonlarca alt dize) başla, sonra eğitim korpusunun genel olabilirliğini en az azaltan token'ları yinelemeli olarak kaldır, hedef boyuta ulaşana kadar. Hayatta kalan token'lar, bir unigram dil modeline göre veriyi en iyi sıkıştıranlardır.

Meta'nın Llama 2'si 32.000 token'lık sözlükle SentencePiece kullandı. Llama 3 bunu **128.256 token'a** dört katladı, bu hamle çok dilli performansı ve kodlama yeteneğini dramatik biçimde iyileştirdi. Tek bu değişiklik — sadece tokenizer — Llama 3 8B'nin birçok ölçütte Llama 2 70B'yi geçmesinin nedenlerinden biriydi. Sözlükteki daha fazla token daha verimli metin temsili, daha verimli temsil de modelin aynı bağlam penceresi içinde daha fazla içerik görebilmesi demekti.

## Gizli Maliyet: Çok Dilli Adaletsizlik

İşte sizi rahatsız etmesi gereken şaşırtıcı, sezgiye aykırı gerçek: **ağırlıklı olarak İngilizce metin üzerinde eğitilmiş bir tokenizer, dünyadaki diğer her dil için sistematik bir ekonomik dezavantaj yaratır.**

Somut bir örnek düşünün. İngilizce "The weather is nice today" cümlesi GPT-4'ün cl100k tokenizer'ında 5 token'a dönüşür. Türkçe karşılığı "Bugün hava çok güzel" 8 token olur. Birmanca ya da Tibetçe'de aynı anlamsal içerik 15-25 token'a genişleyebilir. Yennie Jun ve diğerlerinin 2023'teki araştırması, bazı Afrika ve Güneydoğu Asya dilleri için token-karakter oranının İngilizceden 5-10 kat daha kötü olduğunu gösterdi.

Bu sadece estetik bir sorun değil. Ekonomik bir sorun. GPT-4o için 1.000 token başına 0,01 dolar ödüyorsanız, Birmanca'daki bir sohbet İngilizce'deki aynı sohbetin 3-5 katına mal olur. Modelin etkin bağlam penceresi de 3-5 kat daha küçüktür — 128K bağlam penceresi 128K token tutar, ama diliniz 5 kat daha az verimli tokenize ediliyorsa, etkin olarak 25K token'lık bir pencereniz var.

Kök neden basit: BPE birleştirmeleri korpus sıklığını yansıtır. İngilizce metin eğitim korpuslarına hâkimdir (tipik olarak ön eğitim verisinin %40-60'ı). Dolayısıyla İngilizce alt kelimeler erken aşamada agresif biçimde büyük token'lara birleştirilirken, düşük kaynaklı diller daha küçük parçalara bölünmüş halde kalır. GPT-4o tokenizer'ı (o200k_base) önemli adımlar attı — cl100k'ye kıyasla İngilizce dışı token sayılarını %30-50 azalttığı bildiriliyor — ama uçurum devam ediyor.

Google'ın Gemini tokenizer'ı, daha kasıtlı biçimde çok dilli bir korpus üzerinde eğitilmiş olarak bunu daha iyi idare ediyor. Llama 3'ün Çince, Japonca, Korece ve diğer alfabelere özel token tahsisleri içeren genişletilmiş 128K sözlüğü de öyle. Ama gerçek eşitlik ya dil başına sözlükler (yönetmesi karmaşık) ya da çok daha büyük paylaşımlı sözlükler (parametrelerde pahalı) gerektirir.

## WordPiece: Google'ın Varyantı

Algoritma bahçesinden ayrılmadan önce, BERT ve torunları tarafından kullanılan **WordPiece** hakkında kısa bir not. WordPiece tek bir kritik farkla BPE'ye neredeyse aynıdır: en *sık* çifti birleştirmek yerine, bir dil modeli altında eğitim verisinin olabilirliğini en çok *artıran* çifti birleştirir. Pratikte BPE'ye çok benzer sözlükler üretir ama nadir kelimelerin biraz daha iyi kapsanmasıyla.

BERT sadece 30.522 token'lık bir WordPiece sözlüğü kullandı. 2018'de bu büyük kabul ediliyordu. Bugün nostaljik görünüyor — GPT-4o'nun sözlüğü 6,5 kat daha büyük.

## Gömme Matrisi: Token'ların Vektör Olduğu Yer

Metin tokenize edildikten sonra, her token kimliği **gömme matrisini** indeksler — `(sözlük_boyutu, gizli_boyut)` şeklinde devasa bir arama tablosu. 128.256'lık sözlük ve 16.384'lük gizli boyutla Llama 3 405B için bu tek matris 128.256 × 16.384 = **2,1 milyar parametre** içerir. Bu sadece girdi tarafı; çıktı izdüşümü (bazen "gömme çözme" ya da LM başı denen) aynı şekilde başka bir matris, ancak birçok model parametre tasarrufu için bu ağırlıkları birbirine bağlar.

Gömme matrisi büyüleyicidir çünkü modelin öğrenmenin *seyrek* olduğu *tek* parçasıdır. Model bir metin grubunu işlediğinde, sadece o gruptaki token'lara karşılık gelen satırlar gradyan güncellemesi alır. Eğitim verisinin %0,001'inde görünen nadir bir token, yaygın bir token'ın kabaca %0,001 kadar öğrenme güncellemesi alır. Bu yüzden nadir token'lar genellikle kötü öğrenilmiş gömmelere sahiptir — modellerin alışılmadık Unicode karakterleri ya da son derece nadir kelimelerle karşılaştığında bilinen bir hata modu.

## Özel Token'lar: Gizli Kontrol Dili

BPE tarafından öğrenilen "gerçek" token'ların ötesinde, her tokenizer kontrol sinyalleri olarak hizmet eden ayrılmış kayıtlar olan **özel token'lar** içerir. Son kullanıcılar için görünmez ama model davranışı için kritiktirler:

- **`<|endoftext|>`** (GPT) / **`</s>`** (Llama) — eğitim sırasında belgeler arasındaki sınırı işaretler. Model bir belgenin bitip diğerinin başladığını öğrenerek tüm eğitim verisini tek bir sonsuz metin olarak ele almasını engeller.
- **`<|im_start|>`** ve **`<|im_end|>`** — ChatGPT tarzı modellerde sistem istemlerini, kullanıcı mesajlarını ve asistan yanıtlarını sınırlandırmak için kullanılır.
- **`<|fim_prefix|>`**, **`<|fim_middle|>`**, **`<|fim_suffix|>`** — modelin imleç konumunun öncesini ve sonrasını bilerek kodu tamamlamayı öğrendiği ortayı-doldur eğitimi için kullanılır.

Bu token'lar hiçbir zaman BPE birleştirme algoritması tarafından üretilmez. Sözlüğe elle eklenir ve eğitim sırasında anlam kazandırılır. Eğitim hattı ile model arasındaki özel dildir.

## Hissedebileceğiniz Pratik Sonuçlar

Tokenizasyonu anlamak, başka türlü gizemli olan çeşitli LLM davranışlarını açıklar:

**Aritmetik güçlükleri.** "42173" sayısı `['421', '73']` olarak tokenize edilebilir — modelin rakamları olan bir sayı olarak değil soyut semboller olarak ele aldığı iki token. Modelin örtük ve güvenilmez biçimde `'421'`'den sonra `'73'`'ün bir sayıyı temsil ettiğini ve 1 eklemenin `'421', '74'` üretmesi gerektiğini öğrenmesi gerekir. Şimdi çok basamaklı çarpmayı hayal edin. Rakamların karakter düzeyinde tokenizasyonu matematik için aslında daha kolay olurdu ve bazı araştırma grupları bunu denemiştir.

**"Strawberry" problemi.** GPT-4'e "strawberry'de kaç r var?" diye sorun, önceki versiyonlar 2 derdi (doğru cevap 3). Tokenizer "strawberry"yi `['straw', 'berry']` olarak böler. Model bireysel harfleri hiç görmez — opak token'ların karakter bileşimi hakkında bir şekilde muhakeme yapmak zorundadır. Bu, size kelimenin sadece hecelerini göstererek 'e' harfinin kaç kez geçtiğini sormak gibidir.

**Bağlam penceresi ekonomisi.** Anthropic Claude API kullanımı için ücret aldığında, girdi ve çıktı token'ı başına ödeme yaparsınız. 100 sayfalık bir hukuki belge 150.000 token olabilir. Aynı belge Japoncaya çevrilmiş haliyle 250.000 token olabilir. Aynı bilgi, aynı model, çılgınca farklı maliyetler.

**Kod pahalıdır.** Bol boşluk ve nadir tanımlayıcılara sahip kod verimsiz tokenize olur. 4 boşluklu girintili Python, boşluklara token harcar (modern tokenizer'lar yaygın girinti kalıplarını birleştirmeyi öğrenmiş olsa da). `calculateTotalRevenue` gibi değişken adları 3-4 token olabilirken `x` her zaman 1'dir.

## Sınır: Neler Değişiyor

Alan durmadı. Çeşitli yenilikler tokenizasyonu ileriye taşıyor:

**Bayt düzeyinde modeller.** Meta'nın MegaByte'ı (2023) ve sonraki çalışmalar, tokenizer'ı tamamen ortadan kaldırarak doğrudan ham baytlar üzerinde çalışan modelleri keşfetti. Fikir: modelin kendi segmentasyonunu öğrenmesine izin ver. Sonuçlar umut verici ama büyük ölçekli dil modelleme için henüz BPE ile rekabetçi değil — dizi uzunluğu patlamasını aşmak zor.

**Dinamik sözlükler.** Sözlüğü eğitimden önce dondurmak yerine bazı araştırmacılar, model yeni alanlarla karşılaştıkça yeni birleştirmeler ekleyerek eğitim sırasında uyarlanan tokenizer'ları keşfediyor.

**Tokenizer'sız yaklaşımlar.** Google'ın Charformer'ı (2022), türevlenebilir bir tokenizasyon modülü kullanarak modelin kendisi içinde yumuşak alt kelime sınırlarını öğrendi. Bu, BPE'nin dayattığı sert, ayrık segmentasyon kararlarını kaldırır.

Ama şimdilik BPE kral olmaya devam ediyor. Basit, hızlı, iyi anlaşılmış ve ölçekleniyor. 2026'daki her öncü model — GPT-4o, Claude 3.5, Gemini 2.0, Llama 3.1 — byte-pair encoding'in bir varyantını kullanıyor. 1994 tarihli veri sıkıştırma makalesindeki algoritma olağanüstü dayanıklı çıktı.

---

## Temel Çıkarımlar

1. **Tokenizasyon metni tam sayılara dönüştürür** — insan dili ile nöronal hesaplama arasındaki köprü
2. **BPE sık çiftleri yinelemeli olarak birleştirir** — karakterler ve kelimeler arasında sıkıştırma-optimal bir sözlük bulur
3. **Sözlük boyutu muazzam önem taşır** — GPT-2'nin 50K'sından GPT-4o'nun 200K'sına, daha büyük sözlükler daha ucuz çıkarım ve daha iyi çok dilli performans demek
4. **SentencePiece ön-tokenizasyonu kaldırır** — dil-agnostik işleme için metni ham bayt akışı olarak ele alır
5. **Tokenizasyon adaletsizlik yaratır** — İngilizce dışı diller anlam birimi başına maliyet ve bağlam penceresinde daha fazla öder
6. **Tokenizer model davranışını şekillendirir** — aritmetik, harf sayma ve kod verimliliğinin hepsi tokenizasyon seçimlerinin sonucudur

---

*Yarın Gün 6'da bireysel modellerin mekaniğinden büyük eğitim resmine uzaklaşacağız: bir modele dili sıfırdan gerçekte nasıl öğretirsiniz? Ön eğitimi keşfedeceğiz — modellerin anlayışlarını geliştirmek için internetten trilyonlarca token tükettiği süreç ve maskeli dil modelleme (BERT tarafından kullanılan) ile nedensel dil modelleme (GPT tarafından kullanılan) arasındaki kritik fark. Az önce öğrendiğiniz tokenizer modelin ne gördüğünü belirler; ön eğitim ne öğrendiğini belirler.*

---

<div style="margin-top: 2em; padding: 1.5em; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Zamanı

Bugünkü materyali ne kadar anladığınızı test edin:

<a href="quizzes/day-05.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 5 Quizini Çöz →</a>

</div>
