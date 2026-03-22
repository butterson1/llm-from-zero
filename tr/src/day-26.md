# Gün 26: Açık Kaynak vs Kapalı — Llama, Mistral ve Erişim Tartışması

*2024 ve 2025'in en sonuç doğuran yapay zekâ modelleri onları eğiten şirketler tarafından yayınlanmadı. Sızdırıldı, özgürleştirildi ve kasıtlı olarak verildi — ve nedenleri bu sektörün nereye gittiği hakkında her şeyi söylüyor.*

---

## 100 Milyon Dolarlık Hediye

Temmuz 2023'te Meta, Llama 2'yi — yaklaşık 100 milyon dolarlık eğitim hesaplaması yatırılmış bir model ailesini — ücretsiz ve ticari kullanıma açık olarak yayınladı. Bu, yapay zekâ tarihindeki en büyük "hediye"lerden biriydi. Neden?

Meta'nın stratejisi net: yapay zekâ modellerinin metalaşmasını hızlandırarak kendi ürün avantajını altyapıdan uygulamaya kaydırmak. Açık kaynak modeller rakiplerin API kâr marjlarını eritir ve Meta'nın en çok önem verdiği yere — sosyal medya uygulamalarındaki yapay zekâ entegrasyonuna — odaklanmasını sağlar.

## Üç Kamp

**Kapalı** (OpenAI, Anthropic, Google): Model ağırlıkları gizli. Sadece API erişimi. Argüman: güvenlik, rekabet avantajı, kötüye kullanımı önleme.

**Açık ağırlıklar** (Meta, Mistral, Alibaba): Model ağırlıkları indirilebilir. Bazı kısıtlamalarla (genellikle kullanıcı sayısı eşiği). Argüman: şeffaflık, ekosistem oluşturma, araştırma ilerlemesi.

**Tam açık kaynak** (EleutherAI, Allen AI): Model, veri, eğitim kodu — hepsi açık. Argüman: tekrarlanabilirlik, denetlenebilirlik, demokratikleştirme.

> 💡 **"Açık kaynak" terminolojisi tartışmalı:** Meta'nın Llama lisansı geleneksel açık kaynak tanımını tam karşılamaz (700M+ kullanıcılı şirketler için kısıtlamalar var). OSI (Açık Kaynak Girişimi) daha sıkı tanımlar benimsedi. "Açık ağırlıklar" terimi daha doğru olabilir.

## Kambriya Patlaması

Açık modeller bir ekosistem patlaması yarattı:
- **Binlerce ince ayar**: Hermes, WizardLM, Orca, Dolphin, Turkish-LLM...
- **Niceleme araçları**: llama.cpp, GGUF formatı — modelleri dizüstü bilgisayarda çalıştırma
- **Özel uygulamalar**: Tıp, hukuk, finans — alan-spesifik modeller
- **Araştırma**: Mekanistik yorumlanabilirlik, hizalama araştırması

## Güvenlik Tartışması: Cin Şişeye Geri Konabilir mi?

Kapalı model savunucuları: açık ağırlıklar tehlikeli — biyolojik silah bilgisi, çocuk istismarı materyali üretimi, siber saldırı yetenekleri.

Açık model savunucuları: bilgi zaten mevcut; model bunu yaratmıyor. Kapalı tutmak sadece güç yoğunlaşması yaratır. Güvenlik şeffaflıkla gelir — binlerce araştırmacı açık modeli denetleyebilir, kapalıyı kimse denetleyemez.

Gerçek muhtemelen arada: bazı yetenekler (biosilah sentezi, zero-day exploit üretimi) gerçek risk taşır ve dikkatli yönetim gerektirir. Ama çoğu güvenlik endişesi, açıklığın risklerinden çok kapalılığın risklerini hafife alır.

## Ekonomik Gerçeklik

Açık modeller API fiyatlarını aşağı çeker:
- Llama 3 70B çıkarımı: API fiyatının ~1/5-1/10'u (kendi donanımında)
- Mistral 7B: Tek GPU'da çalışır, neredeyse bedava
- Bu baskı OpenAI ve Anthropic'i fiyat düşürmeye zorlar

Kapalı modellerin avantajı: en son yetenekler (özellikle muhakeme modelleri) ve çok modluluk açıkta 6-12 ay geri kalır.

---

*Yarın yapay zekânın karanlık tarafını keşfedeceğiz: halüsinasyon, kötüye kullanım, deepfake'ler ve varoluşsal kaygılar.*

---

<a href="quizzes/day-26.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 26 Quizini Çöz →</a>
