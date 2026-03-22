# Gün 28: Sırada Ne Var — Test Zamanı Hesaplama, Muhakeme Modelleri ve YGZ'ye Giden Yol

*27 gün boyunca büyük dil modellerinin mimarisini, eğitimini, ekonomisini ve risklerini inceledik. Şimdi sınıra varıyoruz — alanın 2026 ve ötesinde nereye gittiği. Son on sekiz ayın en önemli kavrayışı modelleri daha büyük yapmak hakkında değil. Onları daha uzun düşündürmek hakkında.*

---

## İkinci Ölçekleme Yasası

İlk ölçekleme yasası (Gün 7) eğitim hesaplamasıyla ilgiliydi: daha fazla parametre + daha fazla veri = daha iyi model. İkinci ölçekleme yasası **test zamanı hesaplamayla** ilgili: modele yanıt vermeden önce daha fazla "düşünme" süresi verin.

Bu, 2024'ün en büyük kavramsal kaymasıydı. Geleneksel LLM her sorguya sabit miktarda hesaplama harcar — tek bir ileri geçiş. Muhakeme modelleri (o1, o3, DeepSeek-R1, QwQ) ise yanıt üretmeden önce uzun "düşünme" dizileri oluşturur.

## Muhakeme Modelleri Gerçekte Nasıl Çalışır

Muhakeme modeli iki aşamalıdır:

1. **Düşünme aşaması**: Model gizli "muhakeme token'ları" üretir — problemi analiz eder, farklı yaklaşımları dener, kendini düzeltir, hipotezleri test eder. Bu token'lar kullanıcıya gösterilmez.

2. **Yanıt aşaması**: Düşünme tamamlandıktan sonra model nihai yanıtı üretir.

Bu, insanın zor bir problem üzerinde düşünmesine benzer: hemen yanıt vermek yerine karalama kâğıdında çalışır, farklı yaklaşımları dener, hataları düzeltir.

Eğitim süreci:
- Modele zor problemler (matematik, kodlama, mantık) verilir
- Model uzun muhakeme zincirleri üretir
- Doğru cevaba ulaşan zincirler pozitif, yanlış olanlar negatif ödül alır
- Pekiştirmeli öğrenme ile model daha iyi muhakeme stratejileri keşfeder

## Muhakeme Modeli Patlaması

- **o1** (OpenAI, Eylül 2024): İlk büyük ticari muhakeme modeli. Matematik ve kodlama ölçütlerinde dramatik iyileşme.
- **o3** (OpenAI, Aralık 2024): ARC-AGI ölçütünde %88 — daha önce erişilemez kabul edilen bir seviye.
- **DeepSeek-R1** (Ocak 2025): Açık ağırlıklı muhakeme modeli. o1'e yakın performans, çok daha düşük maliyetle.
- **QwQ** (Alibaba): Çince muhakeme modeli.
- **Gemini 2.0 Flash Thinking**: Google'ın muhakeme yaklaşımı.

## Düşünmenin Sezgiye Aykırı Ekonomisi

Muhakeme modelleri paradoksal bir ekonomi yaratır:
- Basit sorular: Standart modelden 10-100 kat pahalı (gereksiz düşünme)
- Zor problemler: Aslında *daha ucuz* — çünkü doğru cevaba daha az denemede ulaşır

Bu, "her soruya aynı çaba" yerine "zorluğa göre dinamik çaba" paradigmasına geçiş demek.

## Muhakeme Modellerinin (Henüz) Yapamadığı

- **Yaratıcı yazım**: Düşünce zinciri yaratıcılığı artırmaz, bazen kısıtlar
- **Hız gerektiren görevler**: Otomatik tamamlama, gerçek zamanlı sohbet
- **Basit olgusal sorular**: Fazla düşünme gereksiz ve pahalı
- **Çok adımlı aracılık**: Düşünme + araç kullanımı birleşimi henüz ham

## Dil Ötesinde: Dünya Modelleri ve Bedenlenmiş Zekâ

Uzun vadeli vizyon sadece metin değil:

**Dünya modelleri**: Fiziksel dünyanın iç simülasyonları. Video tahmin modelleri (Sora gibi) dünya modellerinin ilk yaklaşımları olabilir — "sonraki kare"yi tahmin etmek, dünyanın fizik kurallarını öğrenmeyi gerektirir.

**Bedenlenmiş zekâ**: LLM'leri robotlara bağlama. Dil modelleri yüksek düzeyde plan yapar ("masadaki bardağı al"), robot modülleri düşük düzeyde uygular (motor kontrol). Figure, 1X, Physical Intelligence gibi şirketler bu alanda çalışıyor.

## YGZ'ye Giden Yol: Tanımlar, Zaman Çizelgeleri ve Dürüst Belirsizlik

**YGZ nedir?** (Yapay Genel Zekâ) Tanım bile tartışmalı:
- OpenAI: "Çoğu ekonomik açıdan değerli işi yapabilen otonom sistem"
- DeepMind: "Çok çeşitli görevlerde insan düzeyinde ya da üstünde"
- Pratik: "Herhangi bir entelektüel görevi bir insan kadar iyi yapabilen yapay zekâ"

**Zaman çizelgeleri**: 
- İyimserler (Altman, Amodei): 2-5 yıl içinde
- Temkinliler (Hinton, Marcus): 10-30 yıl, eğer olursa
- Şüpheciler (LeCun): Mevcut paradigma yetmez, temel atılımlar gerekir

**Dürüst cevap**: Bilmiyoruz. Mevcut ölçekleme eğrileri izlenimci ama "zekâ"nın ne olduğu bile üzerinde uzlaşılmamış. O1/o3'ün ARC-AGI'daki başarısı etkileyici ama "genel zekâ"dan çok "belirli bir ölçütte yüksek puan" olabilir.

## Yakınsama Tezi

Son 28 günde gördüğümüz büyük resim:

1. **Mimari yakınsama**: Herkes Transformer kullanıyor
2. **Eğitim yakınsama**: Herkes nedensel dil modelleme + RLHF/DPO kullanıyor
3. **Ölçekleme yakınsama**: Eğitim zamanı + test zamanı hesaplama birlikte ölçekleniyor
4. **Uygulama yakınsama**: Tüm modeller ajansal, çok modlu ve muhakeme yeteneğine doğru ilerliyor

Birbirinden ayrışan: iş modelleri, güvenlik yaklaşımları ve açık/kapalı stratejiler.

---

## Sonsöz

28 gün önce bir dil modelinin ne olduğunu — kelime dizilerine olasılık atayan bir sistem — öğrenerek başladık. Kelime sayma algoritmalarından trilyonlarca parametreli, dünya üzerinde eylem alabilen, kendini eleştirebilen ve insanın düşünme sürecini taklit edebilen sistemlere uzanan bir yolculuk yaptık.

Bu alan hızla değişiyor. Bugün yazdığımız bazı bilgiler aylar içinde güncelliğini yitirebilir. Ama temeller — dikkat, ölçekleme yasaları, ön eğitim ve ince ayar arasındaki ilişki, hizalama problemi — bunlar kalacak.

Öğrenmeye devam edin. Sorgulayın. Ve her şeyden önemlisi: bu teknolojiyi sorumlu kullanın.

---

*Bu 28 günlük yolculuğu tamamladığınız için tebrikler. 🎉*

---

<a href="quizzes/day-28.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 28 Quizini Çöz →</a>
