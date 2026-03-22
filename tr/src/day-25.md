# Gün 25: Ekonomi — Çıkarım Maliyetleri, API Fiyatlandırması ve Kim Para Kazanıyor

*Tek bir ChatGPT konuşması 0,003 dolara mal olabiliyor ama OpenAI hâlâ milyarlar yakıyor — ve neden tüm yapay zekâ sektörü birim ekonomisinin para bitmeden tersine döneceğine bahse girmiş durumda.*

---

## Şimdiye Kadar Yapılmış En Pahalı Yazılım

GPT-4'ün eğitimi ~100 milyon dolara mal oldu. Ama eğitim tek seferlik. Asıl süregelen maliyet **çıkarım** — modeli her gün milyonlarca kullanıcıya hizmet vermek. OpenAI'ın 2024 gelirinin ~3,4 milyar dolar, işletme giderlerinin ise ~5 milyar doların üzerinde olduğu tahmin ediliyor. Hâlâ kârsız.

## Bir Çıkarım Dolarının Anatomisi

Token başına maliyet birkaç bileşenden oluşur:
- **GPU hesaplama**: En büyük pay. H100 saati ~$2-3.
- **Bellek**: KV önbellek ve model ağırlıkları GPU belleğini tüketir
- **Ağ**: Girdi/çıktı aktarımı
- **Altyapı**: Soğutma, güç, personel

Fiyatlandırma genellikle girdi token'ı ve çıktı token'ı ayrı — çıktı daha pahalı çünkü her token sıralı üretilir (otoregresif darboğaz).

## Kimsenin Beklemediği Fiyat Savaşı

2023-2025 arasında API fiyatları çığ gibi düştü:
- GPT-4 (Mart 2023): $30/M girdi token, $60/M çıktı
- GPT-4o (Mayıs 2024): $5/M girdi, $15/M çıktı
- GPT-4o-mini (Temmuz 2024): $0,15/M girdi, $0,60/M çıktı
- Gemini 1.5 Flash: $0,075/M girdi

Bu, 2 yılda **400 kat fiyat düşüşü** demek. Moore Yasası'ndan çok daha hızlı.

## Küvet Eğrisi: Muhakeme Modelleri Neden Fiyat Hikâyesini Bozuyor

o1/o3 gibi muhakeme modelleri bu trendi tersine çevirdi — "düşünme" token'ları pahalı. o1-pro tek bir yanıt için 100K+ token üretebilir. Bu, basit sorular için ucuz ama karmaşık muhakeme için çok pahalı bir maliyet yapısı yaratır.

## Gerçekten Kim Para Kazanıyor?

- **NVIDIA**: GPU satarak. 2024 geliri ~60 milyar dolar. Sektörün en kârlı şirketi.
- **Bulut sağlayıcıları** (AWS, Azure, GCP): GPU kiralayarak. Yapay zekâ, bulut gelirlerinin en hızlı büyüyen segmenti.
- **Uygulama katmanı**: Henüz belirsiz. Çoğu yapay zekâ startup'ı hâlâ kârsız.

## Jevons Paradoksu ve Talep Eğrisi

1865'te William Jevons buhar motorlarının verimliliği artıkça kömür tüketiminin azalmadığını, aksine *arttığını* gözlemledi — ucuzlayan enerji yeni kullanım alanları açtığı için. Aynı dinamik yapay zekâda: fiyatlar düştükçe kullanım patlıyor, toplam harcama artıyor.

## Kendi Barındırmanın Şaşırtıcı Matematiği

Tek bir A100 80GB ($15K) ile Llama 3 70B'yi 4-bit nicelemeyle çalıştırabilirsiniz. Aylık ~$300 elektrik ve amortisman maliyetiyle, yoğun kullanımda API'den 5-10 kat ucuz olabilir.

Ama: teknik uzmanlık, bakım, ölçekleme ve güncelleme maliyetlerini unutmayın. Çoğu şirket için API hâlâ daha pratik.

---

*Yarın açık kaynak vs kapalı tartışmasını inceleyeceğiz: Llama, Mistral ve erişim tartışması.*

---

<a href="quizzes/day-25.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 25 Quizini Çöz →</a>
