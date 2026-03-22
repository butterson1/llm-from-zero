# Gün 14: Ortaya Çıkan Yetenekler — Düşünce Zinciri, Araç Kullanımı ve Kimsenin Öngöremediği Şeyler

*Büyük dil modelleriyle ilgili en tuhaf şey, yapmalarını tasarladığımız şey değil — kendi başlarına yapmayı öğrendikleri. Ve yapay zekâdaki en şiddetli tartışma şu anda bu "öğrenme"nin gerçek olup olmadığı.*

---

## Alanı Sarsan Keşif

2022'de Google'dan Jason Wei ve ark., bir dizi dikkat çekici gözlemi belgeleyen "Emergent Abilities of Large Language Models" makalesini yayınladı. Belirli görevlerde küçük modeller şansa yakın performans gösterirken, belirli bir ölçeğin üstünde modeller aniden ve dramatik biçimde yetkinleşiyordu. Çok adımlı aritmetik, analojik muhakeme, talimat takibi — bu yeteneklerin hiçbiri açıkça eğitilmemişti ama belirli parametresayılarında "açılıyor" gibiydi.

Gün 7'de gördüğümüz gibi, bu "ortaya çıkış" aslında düzgün kayıp iyileşmesinin göreve özgü eşikleri aşmasının sonucu olabilir. Ama fenomen gerçek: ölçek yetenekler yaratır.

## Sürprizler Kataloğu

Ortaya çıkan yeteneklerin bazıları:

- **Çok adımlı aritmetik:** ~100B parametreden sonra modeller dört işlemi tutarlı biçimde yapabilir hale geldi
- **Düşünce zinciri muhakemesi:** "Adım adım düşünelim" sihirli kelimeleri büyük modellerde doğruluğu dramatik artırırken küçük modellerde hiç etki göstermiyordu
- **Analojik muhakeme:** "A, B'ye, C ise ___'a" yapılarında tutarlı genelleme
- **Çeviri:** Hiç paralel çeviri verisi görmemiş modellerin diller arası çeviri yapabilmesi
- **Araç kullanımı:** Hesap makinesi, arama motoru ya da API çağırmayı öğrenme

## Sıfır-Örnekli Düşünce Zinciri: Beş Kelimelik Devrim

Belki de en çarpıcı ortaya çıkış, Kojima ve ark.'nın (2022) keşfi: bir istemin sonuna sadece **"Adım adım düşünelim"** ("Let's think step by step") eklemek, sıfır-örnekli muhakeme performansını dramatik biçimde artırıyordu. MultiArith ölçütünde doğruluk %18'den %79'a fırladı.

Bu neden çalışır? Otoregresif modeller çıktı token'ı başına sabit miktarda hesaplama yapar. Ara adımlar üretmesini istediğinizde, modele çok-adımlı bir problem üzerinde *daha fazla hesaplama adımı* vermiş olursunuz. Her ara token potansiyel olarak bilgiyi rafine eder ve sonraki adım için bağlam oluşturur.

> 📐 **Diyagram notu:** Burada standart istem vs düşünce zinciri istemi karşılaştırmasını gösteren bir akış diyagramı çok faydalı olurdu — standart istemde doğrudan cevap, CoT'ta ara adımlar zinciri ve nihai cevap.

## Öz-Tutarlılık ve Kalabalıkların Bilgeliği

Wang ve ark. (2023) düşünce zincirini genişleten **öz-tutarlılık** (self-consistency) yöntemini tanıttı: aynı soruyu yüksek sıcaklıkla birden çok kez çözün, her seferinde farklı muhakeme yolları alın ve en çok oy alan cevabı seçin. Bu, GSM8K gibi matematik ölçütlerinde doğruluğu %5-15 daha artırdı.

Sezgisel açıklama basit: doğru cevaba birden fazla bağımsız yoldan ulaşmak, tek bir yoldan ulaşmaktan daha güvenilir. Bu, istatistikteki topluluk (ensemble) yöntemlerinin doğrudan muhakemeye uygulanması.

## Araç Kullanımı: Modeller Telefon Açmayı Öğrendiğinde

2023'te Schick ve ark.'nın **Toolformer** makalesi önemli bir kavrayış sundu: dil modelleri hangi token dizisinin bir araç çağrısı temsil ettiğini ve sonucu nereye ekleneceğini *kendi kendine öğrenebilir*. Model, hesap makinesi çağrısı eklemenin kaybı azaltacağı yerleri tespit eder ve otomatik olarak eğitim verisi üretir.

Modern uygulamada araç kullanımı şöyle çalışır:
1. Model bir fonksiyon çağrısı üretir (örn. `search("Türkiye'nin başkenti")`)
2. Sistem çağrıyı yürütür ve sonucu modele döndürür
3. Model sonucu yanıtına entegre eder

Bu, Gün 23'te derinlemesine inceleyeceğimiz "ajanlar"ın temelidir.

## Serap Tartışması: Ortaya Çıkan Yetenekler Gerçek mi?

2023'te Stanford'dan Schaeffer ve ark. kışkırtıcı bir karşı-argüman sundu: ortaya çıkış, modellerin ölçeklenme özelliği değil, *ölçüm yönteminin* bir eseri. Kesikli metrikler (doğru/yanlış) kullandığınızda düzgün iyileştirmeler keskin geçişler gibi görünür. Sürekli metrikler (kısmi kredi) kullandığınızda "ortaya çıkış" kaybolur ve düzgün, kademeli iyileştirme görürsünüz.

Bu tartışma devam ediyor. Orta yol görüşü: altta yatan iyileştirme düzgün (Gün 7'deki ölçekleme yasaları), ama pratik etkisi — belirli görevleri yapabilme veya yapamama — gerçekten süreksiz olabilir, çünkü görevler genellikle her şey-ya-da-hiç niteliktedir.

## Modellerin Bildiği Ama Gösteremediği Şeylerin Bilimi

Belki de en derin çıkarım şu: ölçütler modellerin yeteneklerini sistematik olarak hafife alır. Bir modelin belirli bir ölçütteki puanı "bu model bu konuda ne kadar iyi" değildir. "Bu model bu konuda *bu özel istem stratejisiyle* ne kadar iyi"dir. İstem stratejisini değiştirin ve puanı, bazen dramatik biçimde, değiştirirsiniz.

Bu, modellerin prensipte yapabildiği ile pratikte yaptığı arasındaki uçurumun muazzam olduğu anlamına gelir — ve bu uçurumu kapatmak daha büyük modeller inşa etmek kadar önemlidir. Test zamanı hesaplama ölçeklemesi, muhakeme token'ları ve genişletilmiş düşünme bu temanın varyasyonlarıdır: modellere zaten bildiklerini ifade etmeleri için daha fazla hesaplama pisti vermek.

---

*Yarın bu alandaki ticari açıdan en başarılı hikâyeye yakınlaşıyoruz: **GPT-1'den GPT-4'e GPT serisi**. Küçük bir ekibin "sadece daha büyük yap" bahsinin nasıl karşılık verdiğini ve tüm teknoloji endüstrisini nasıl yeniden şekillendirdiğini izleyeceğiz.*

---

## 📝 Quiz Zamanı

<a href="quizzes/day-14.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 14 Quizini Çöz →</a>
