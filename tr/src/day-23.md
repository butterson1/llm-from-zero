# Gün 23: Ajanlar ve Araç Kullanımı — Sohbet Botundan Otonom Çalışana

*Dil modellerinin dünya hakkında sadece konuşmayı bırakıp içinde hareket etmeye başladığı an.*

---

## Sohbet Botu Tavanı

Sohbet botu metin girer, metin çıkarır. Bu güçlü ama sınırlı. E-posta gönderemez, API çağıramaz, dosya oluşturamaz, web'de gezinmez. **Ajanlar** bu duvarı yıkar: dil modellerini dünyada eylem alabilen sistemlere dönüştürür.

## Bir Ajanı Ajan Yapan Ne

Bir ajan dört temel bileşene sahiptir:
1. **Algılama**: Çevreden bilgi alma (metin girişi, API yanıtları, ekran görüntüsü)
2. **Muhakeme**: Ne yapılacağına karar verme (dil modeli)
3. **Eylem**: Dünyada değişiklik yapma (araç çağrısı, kod çalıştırma)
4. **Bellek**: Geçmiş eylemleri ve sonuçları hatırlama

## Araştırma Soy Ağacı: ReAct'ten Toolformer'a

**ReAct** (Yao ve ark., 2022): "Muhakeme et + Eylem al" — model düşünce ve eylem adımlarını serpiştirir: "Bu soruyu yanıtlamak için güncel bilgiye ihtiyacım var → [Arama: 'Türkiye cumhurbaşkanı 2026'] → Sonuç: ... → Bu bilgiye dayanarak..."

**Toolformer** (Schick ve ark., 2023): Model hangi araçları ne zaman çağıracağını *kendi kendine öğrenir* — hesap makinesi, arama, takvim, vb.

## Ajan Mimarileri

**Tek ajan döngüsü**: Model → Araç → Gözlem → Model → Araç → ... sonuca kadar. Basit ama güçlü.

**Planlayıcı-icracı ayrımı**: Bir model planlar, başka bir (belki daha küçük) model planı uygular.

**Yansıtıcı ajanlar**: Model eylemlerini değerlendirir ve planını revize eder. Reflexion (Shinn ve ark., 2023) bunu resmileştirdi.

## Bilgisayar Kullanımı: Gören ve Tıklayan Modeller

2024'ün en çarpıcı gelişmelerinden biri: modeller **bilgisayar ekranını görerek** fare tıklaması ve klavye girişi yapabiliyor. Anthropic'in "Computer Use" özelliği ile Claude, tarayıcı açabilir, form doldurabilir, uygulama kullanabilir.

Bu, otomasyon için devrim niteliğinde — GUI otomasyonu artık kod yazmak yerine modele ne yapmasını *söylemekle* mümkün.

## Ajansal Kodlama Devrimi

Kodlama ajanları (Devin, Cursor, Claude Code, Codex) en başarılı ajan uygulamaları. Neden? Kodlama ortamı:
- Deterministik geri bildirim sağlar (kod çalışır veya çalışmaz)
- Sandbox'lanabilir (güvenli deneyler)
- Yinelemeli iyileştirme mümkün (hata ayıklama döngüsü)

## Çoklu Ajan Sistemleri

Birden fazla ajan birlikte çalışarak karmaşık görevleri böler:
- **Hiyerarşik**: Bir yönetici ajan alt ajanlara görev atar
- **Tartışma**: Ajanlar birbirleriyle tartışarak daha iyi sonuçlara ulaşır
- **Sürü**: Birçok ajan aynı sorunu paralel çözer

## Güven Problemi

Ajanların en büyük sorunu güven. Bir ajanın yanlış bir e-posta göndermesi, yanlış bir API çağrısı yapması ya da istenmeyen bir dosyayı silmesi gerçek sonuçlara sahiptir. Bu yüzden çoğu üretim ajanı "insan döngüde" modunda çalışır — kritik eylemlerde onay ister.

---

*Yarın kodlama — LLM'lerin en dönüştürücü uygulaması: **Copilot, Codex ve Neden Kod Katil Uygulamadır.***

---

<a href="quizzes/day-23.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 23 Quizini Çöz →</a>
