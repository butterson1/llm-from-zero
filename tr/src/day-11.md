# Gün 11: RLHF — Modellere Yardımcı Olmayı Öğretmek

*İnsan geri bildiriminden pekiştirmeli öğrenme ham metin tahmincilerini gerçekten kullandığımız asistanlara nasıl dönüştürdü — ve alan neden zaten ötesine geçiyor.*

---

## Kimsenin Beklemediği Problem

İşte modern yapay zekânın kalbindeki paradoks: internetten trilyonlarca token üzerinde eğitilmiş bir dil modeli, her nesnel ölçütle olağanüstü yeteneklidir. GPT-3, Haziran 2020'de piyasaya çıktığında şiir yazabilir, kod hatası ayıklayabilir, diller arası çeviri yapabilir ve bilinmeyik trivia sorularını yanıtlayabilirdi. Ama basit bir soru sorun — "Bomba nasıl yapılır?" — ve neşeyle uyumlu olurdu. Belge özetlemesini isteyin ve belgeyi makul görünen saçmalıkla devam ettirebilir. Tıbbi tavsiye isteyin ve kadrolu profesör güveniyle halüsinasyon yapardı.

Model *yetkin* ama *hizalı* değildi. Sırada hangi metnin geleceğini tahmin edebilirdi ama hangi metnin gelmesi *gerektiği* kavramına sahip değildi. Bu uçurum — ham yetenek ile gerçek yardımcılık arasındaki — yapay zekânın en önemli problemi oldu. Ve ortaya çıkan çözüm, **İnsan Geri Bildiriminden Pekiştirmeli Öğrenme (RLHF)**, dil modellerini etkileyici demolardan yüz milyonlarca insanın kullandığı ürünlere dönüştüren belki de tek yeniliktir.

InstructGPT makalesi hâlâ şok eden bir bulguyla Mart 2022'de yayınlandı: RLHF ile ince ayar yapılmış **1,3 milyar parametreli** bir model, insan değerlendiriciler tarafından **175 milyar parametreli** temel modele (GPT-3) tercih edildi. 135 kat daha küçük bir model, ama daha iyi hizalamayla, daha kullanışlıydı. Yetenek darboğaz değildi — hizalama darboğazdı.

## Üç Adımlık Reçete

RLHF, InstructGPT'de uygulanıp esasen her büyük yapay zekâ laboratuvarı tarafından benimsendiği haliyle, yanıltıcı biçimde basit üç adımlık bir süreci takip eder.

### Adım 1: Denetimli İnce Ayar (SFT)

Pekiştirmeli öğrenmeyle bir şey yapmadan önce en azından doğru alanda bir başlangıç noktasına ihtiyacınız var. OpenAI 40 insan etiketçi tutup on binlerce istem için ideal yanıtlar yazdırdı. Bu, yardımsever, zararsız ve dürüst bir yapay zekâ asistanının ne söylemesi gerektiğinin özenle hazırlanmış gösterimleriydi.

Temel model (GPT-3) bu gösterim verisi üzerinde standart denetimli öğrenmeyle ince ayar yapıldı. Bu SFT model zaten temel modelden dramatik biçimde daha iyi — soruları *yanıtlaması* gerektiğini biliyor, sadece metni *devam ettirmeyi* değil. Ama hâlâ insan yazımı gösterimlerin kalitesi ve çeşitliliğiyle sınırlı.

İşte gerçek sihir burada başlıyor.

### Adım 2: Ödül Modeli Eğitimi

Kilit kavrayış şu: **insanların çıktıları yargılaması, üretmesinden daha kolaydır.** "10 yaşındaki çocuğa kuantum dolaşıklığını açıkla" sorusuna mükemmel yanıt yazmak zor. Ama iki aday yanıt verildiğinde hangisinin daha iyi olduğunu seçmek? Çok daha kolay, hızlı ve güvenilir.

OpenAI, insan etiketçilere aynı istem için model çıktı çiftleri (ya da grupları) gösterip en iyiden en kötüye sıralamalarını isteyerek karşılaştırma verisi topladı. Yaklaşık 33.000 istem üzerinde tercih sıralamaları toplandı — mutlak puanlar değil, göreli karşılaştırmalar.

Bu karşılaştırma verisi bir **ödül modeli (RM)** eğitmek için kullanıldı — bir istem ve yanıt alıp insan tercihlerine göre o yanıtın ne kadar "iyi" olduğunu temsil eden tek bir sayı çıkaran ayrı bir sinir ağı.

Ödül modeli, çiftli tercihlerin **Bradley-Terry modeli** kullanılarak eğitilir. A yanıtı B'ye tercih edildiyse, ödül modeli RM(istem, A) > RM(istem, B) olacak şekilde optimize edilir. Kayıp fonksiyonu:

**Kayıp = -log(σ(r(tercih edilen) - r(reddedilen)))**

> 💡 **Neden mutlak puanlar değil de karşılaştırmalar?** İnsanlar "bu yanıt 7/10" demekte çok tutarsız ama "A, B'den daha iyi" demekte çok daha tutarlıdır. Ödül modeli bu göreli sinyali mutlak puana dönüştürür.

### Adım 3: PPO ile Pekiştirmeli Öğrenme

Eğitilmiş bir ödül modeliyle dil modelini yüksek puan alan çıktılar üretecek şekilde — daha fazla insan geri bildirimine ihtiyaç duymadan — optimize edebilirsiniz.

Kullanılan algoritma **Proximal Policy Optimization (PPO)** — OpenAI'ın John Schulman tarafından 2017'de geliştirilen pekiştirmeli öğrenme yöntemi. RL terimleriyle dil modeli **politikadır** (durumları eylemlere eşler), her token üretimi bir **eylemdir** ve ödül modelinin yanıt sonundaki puanı **ödüldür**.

Ama kritik bir kısıtlama var: ödül modelinin puanını körce maksimize edemezsiniz. Yapsanız model, ödül modelindeki zayıflıkları istismar eden dejenere çıktılar hızla bulurdu — **ödül korsanlığı** denen olgu. Çok uzun yanıtlara ya da "Harika soru!" ile başlayanlara ya da kaliteyle korelasyon gösteren ama aslında yardımcı olmayan kalıplara yüksek puan verdiğini keşfedebilir.

Çözüm **KL ıraksama cezasıdır** — RL-ayarlı modelin SFT modelinin dağılımından çok uzaklaşmasını cezalandıran hedef fonksiyonundaki bir terim:

**Ödül = RM(istem, yanıt) - β · KL(π_RL || π_SFT)**

β çok az olursa ödül korsanlığı, çok fazla olursa model SFT'den zar zor değişir. β'yı doğru ayarlamak RLHF'nin kritik hiperparametrelerinden biri.

## InstructGPT'nin Arkasındaki Rakamlar

- **Gösterim verisi:** SFT için 13.000 istem-yanıt çifti
- **Karşılaştırma verisi:** Ödül modeli için sıralanmış çıktılarla 33.000 istem
- **Etiketçi ekibi:** Uyum oranları için özenle elenen ~40 yüklenici
- **Etiketçi uyumu:** Sıralamada ~%73 (insanlar birbirleriyle bile tam uyuşmuyor)
- **SFT model:** 1,3B, 6B ve 175B parametre varyantları
- **Ödül modeli:** 6B parametre

Sonuç? 1,3B InstructGPT modeli karşılaştırmaların **%85'inde** 175B GPT-3 temel modeline tercih edildi. Bu marjinal bir iyileştirme değildi — algılanan yararlılıkta niteliksel bir sıçramaydı.

## PPO Neden Bu Kadar Zor

PPO'nun dil modellerine uygulanması modern makine öğrenmesindeki en hassas eğitim prosedürlerinden biri. Dört modeli aynı anda eğitmek gerekir — politika modeli (optimize edilen), referans model (KL cezası için donmuş SFT model), ödül modeli ve değer modeli (beklenen gelecek ödülleri tahmin eden). Hepsi GPU belleğine sığmalı ve etkileşimleri karmaşık eğitim dinamikleri yaratır.

PPO'nun yaratıcısı John Schulman bile 2023'teki Berkeley konuşmasında RLHF'nin iyi çalışması için "çok hile" ve "dikkatli mühendislik" gerektirdiğini açıkça anlattı.

## DPO: Aracıyı Devre Dışı Bırakmak

PPO'nun tüm baş ağrıları düşünüldüğünde doğal bir soru doğar: pekiştirmeli öğrenmeye gerçekten *ihtiyacımız var mı*? Mayıs 2023'te Stanford'dan bir ekip — Rafael Rafailov ve meslektaşları — hizalama topluluğunda şok dalgaları yaratan bir makale yayınladı: **Doğrudan Tercih Optimizasyonu (DPO)**.

Temel kavrayışları matematiksel ve güzeldi: RLHF hedefinin (KL cezalı ödül maksimizasyonu) optimal çözümü, tercih verileriyle kapalı biçim bir ilişkiye sahip. Denlemleri yeniden düzenleyerek ödül modelinin hizalı politikanın referans politikaya oranıyla örtük olarak tanımlandığını gösterebilirsiniz. Bu, ödül modelini tamamen atlayıp dil modelini doğrudan tercih çiftleri üzerinde optimize edebileceğiniz anlamına gelir.

DPO'nun avantajları büyük:
- **Ödül modeli gerekmez** — bellek, hesaplama ve karmaşıklık tasarrufu
- **RL eğitim döngüsü yok** — standart denetimli optimizasyon
- **Kararlı eğitim** — normal ince ayar gibi davranır, hata ayıklaması çok daha kolay
- **Benzer ya da daha iyi sonuçlar** — özetleme ve yardımcılık ölçütlerinde PPO ile eşleşti ya da geçti

DPO o kadar etkili oldu ki 2024 itibariyle birçok laboratuvar — Anthropic dahil bildirilen kaynaklara göre — PPO'dan DPO'ya ya da DPO varyantlarına geçti. Zephyr, Starling ve OpenChat gibi açık kaynak modellerin çoğu DPO kullanır.

## PPO'nun Ötesinde: Tercih Optimizasyonunun Evrimi

DPO'nun başarısı tercih öğrenme yöntemlerinin patlamasını tetikledi:

- **IPO** (Identity Preference Optimization): DPO'nun β hiperparametresine duyarlılığını azaltır
- **KTO** (Kahneman-Tversky Optimization): Çiftli tercihler yerine tekli ikili geri bildirimle (iyi/kötü) çalışır
- **ORPO** (Odds Ratio Preference Optimization): SFT ve tercih öğrenmeyi tek adımda birleştirir
- **SimPO** (Simple Preference Optimization, 2024): Referans modeli tamamen kaldırır

Bu yöntemler üzerinde ortak bir tema var: RLHF'nin zor kısımlarını ortadan kaldırarak giriş engelini düşürmek. Artık tek bir GPU'da tercihe dayalı hizalama yapabilirsiniz — 2022'de çok-GPU PPO döngüsü gerektiren bir şey.

## Kim Karar Veriyor?

RLHF temel bir felsefi soruyu gündeme getiriyor: kimin tercihleri sayılır? OpenAI'ın tuttuğu 40 yüklenici mi? Scale AI'daki binlerce gig işçisi mi? Karşılaştırma verisine gömülü değerler "yardımcı" ve "zararsız"ın ne anlama geldiğine dair belirli seçimleri yansıtır ve bu seçimler kültürel olarak tarafsız değildir.

Bu yüzden hizalama araştırması sadece teknik bir problem değil — derinden felsefi bir problem. Ve yarın Anthropic'in bununla doğrudan boğuşma girişimini keşfedeceğiz: **Anayasal YZ**, insan tercihlerinden örtük olarak öğrenmek yerine değerleri açıkça belirlemeye çalışan bir yaklaşım.

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Zamanı

<a href="quizzes/day-11.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 11 Quizini Çöz →</a>

</div>
