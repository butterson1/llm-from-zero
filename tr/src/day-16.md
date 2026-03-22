# Gün 16: Claude, Gemini, Llama — Diğer Laboratuvarlar GPT'den Nasıl Ayrıştı

*OpenAI haritayı çizdi, ama 2023-2025'in en ilginç yapay zekâ hikâyesi diğer laboratuvarların farklı yollar almaya karar verdiğinde — ve bazen daha iyi yollar bulduğunda — ne olduğudur.*

---

## Anthropic: Güvenlik Laboratuvarından Yetenek Laboratuvarına

Anthropic, 2021'de OpenAI'dan ayrılan Dario ve Daniela Amodei liderliğinde kuruldu. Misyonları: yapay zekâ güvenliğini öncelik yaparak öncü modeller inşa etmek. Claude serisi (Claude 1, 2, 3 Haiku/Sonnet/Opus, 3.5 Sonnet) bu vizyonun ürünleri.

Anthropic'in kilit ayrışma noktaları:
- **Anayasal YZ** (Gün 12): İnsan etiketçiler yerine yazılı ilkeler
- **Uzun bağlam**: Claude 2, 100K token penceresiyle öncü oldu; Claude 3, 200K'ya çıktı
- **Karakter**: Claude, yaratıcı ve dürüst kişiliğiyle tanındı — "bilmiyorum" demeyi tercih etmesiyle
- **Güvenlik araştırması**: Mekanistik yorumlanabilirlik, yıkım-öncesi güvenlik testleri

İlginç bir ironi: güvenliğe odaklanan laboratuvar aynı zamanda en yetenekli modellerden bazılarını üretti. Claude 3.5 Sonnet, 2024-2025'te birçok kodlama ve muhakeme ölçütünde GPT-4'ü geçti.

## Google DeepMind: Çok Modlu Bahis

Google, yapay zekâda en derin ve geniş araştırma geçmişine sahip — ama ChatGPT'nin lansmanı onları hazırlıksız yakaladı. Yanıt: Google Brain ve DeepMind'ı birleştirerek Google DeepMind'ı kurmak ve Gemini serisini çıkarmak.

Gemini'nin kilit ayrışma noktaları:
- **Doğuştan çok modlu**: Metin, görüntü, ses ve video tek modelde
- **TPU altyapısı**: Özel donanım avantajı, Google'ın uçtan uca kontrol ettiği eğitim altyapısı
- **Devasa bağlam**: Gemini 1.5 Pro ile 1 milyon token penceresi — sektör rekoru
- **Arama entegrasyonu**: Google Arama ile doğal entegrasyon (Grounding)

Gemini Ultra standart ölçütlerde GPT-4'e rakip olurken, Gemini Flash serisi maliyet-performans oranında liderlik etti.

## Meta'nın Llama: Açık Kaynak Depremi

Meta'nın stratejisi radikal biçimde farklıydı: **modelleri ücretsiz verin**. Llama 1 (Şubat 2023, sızıntı), Llama 2 (Temmuz 2023, resmi açık kaynak), Llama 3 (Nisan 2024) her biri bir deprem yarattı.

Llama'nın etkisi:
- **Demokratikleştirme**: Herkes öncü düzeyde modeli indirip çalıştırabilir
- **Ekosistem**: Binlerce ince ayar, varyant ve uygulama
- **Fiyat baskısı**: Açık kaynak modeller API fiyatlarını aşağı çekti
- **Araştırma**: Akademik araştırmacılar ilk kez öncü modellerin iç yapısını inceleyebildi

Llama 3 405B, açık erişimli modellerin GPT-4 düzeyine yaklaşabileceğini kanıtladı.

> 💡 **Türkiye'de etkisi**: Llama'nın açık kaynak olması, Türk araştırmacılar ve geliştiriciler için büyük fırsat. Yerel donanımda çalıştırılabilir modeller, veri egemenliği endişelerini azaltır ve Türkçe'ye özel ince ayar yapılabilir.

## Mistral: Avrupalı Karaatı

Mistral AI, 2023'te Paris'te kuruldu ve küçük ama şaşırtıcı derecede güçlü modeller üretti. Mistral 7B, boyutunun çok üstünde performans gösteren ilk model olarak dikkat çekti. Mixtral 8x7B (Uzmanlar Karışımı) ve Mistral Large, Avrupa'nın yapay zekâ yarışında ciddi bir oyuncu olduğunu gösterdi.

## Yakınsamalar ve Ayrışmalar

Tüm laboratuvarlar bazı konularda yakınsıyor:
- Hepsi yalnızca-kod çözücü Transformer kullanıyor
- Hepsi RLHF/DPO tabanlı hizalama uyguluyor
- Hepsi daha büyük bağlam pencereleri sunuyor
- Hepsi çok modlu yetenekler ekliyor

Ayrıştıkları yerler:
- **Açık vs kapalı**: Meta ve Mistral açık kaynak; OpenAI ve Google kapalı; Anthropic arada
- **Güvenlik yaklaşımı**: Anthropic (anayasal), OpenAI (pragmatik RLHF), Meta (topluluk güdümlü)
- **İş modeli**: OpenAI (API + abonelik), Google (arama entegrasyonu), Meta (ekosistem oluşturma), Anthropic (kurumsal API)
- **Ölçekleme stratejisi**: Bazıları daha büyük model, bazıları daha verimli model, bazıları test-zamanı hesaplama

---

*Yarın modellerin nasıl hesaplama maliyeti olmadan büyüdüğünü keşfedeceğiz: **Uzmanlar Karışımı** — en güçlü dil modellerinin arkasındaki kirli sır.*

---

## 📝 Gün 16 Quiz

<a href="quizzes/day-16.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 16 Quizini Çöz →</a>
