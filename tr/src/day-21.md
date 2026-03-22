# Gün 21: Çok Modlu Modeller — Görüntü, Ses ve Birleşik Zekâya Giden Yol

*Bir dil modeline görmeyi öğretmek neden şok edici derecede kolaydı — ve gördüğünü gerçekten anlamasını öğretmek neden şok edici derecede zor.*

---

## Birleştirme Tezi

İnsanlar dünyayı tek bir modalitede deneyimlemez — aynı anda görür, duyar, dokunur, okur. Yapay zekânın uzun vadeli vizyonu da budur: tüm modaliteleri tek bir modelde birleştirmek. 2023-2025 döneminde bu vizyon büyük ölçüde gerçeğe dönüştü.

## Görüntü Bir Dil Modeline Nasıl Girer

En yaygın yaklaşım: bir **görme kodlayıcısı** (genellikle ViT — Vision Transformer) görüntüyü vektör dizisine dönüştürür, sonra bir **projeksiyon katmanı** bu vektörleri dil modelinin beklediği boyuta eşler. Görüntü vektörleri, metin token'ları gibi dil modeline beslenir.

Kilit mimariler:
- **LLaVA** (2023): ViT + doğrusal projeksiyon + Llama. Basit ama etkili.
- **GPT-4V**: Görüntü girdisi kabul eden ilk büyük ticari model
- **Gemini**: Doğuştan çok modlu — görüntü, metin, ses, video tek modelde
- **Claude 3**: Görüntü anlama yeteneği eklenmiş

## Ses Devrimi

Ses modelleri de hızla ilerledi:
- **Whisper** (OpenAI, 2022): 680K saat ses üzerinde eğitilmiş çok dilli konuşma tanıma
- **GPT-4o**: Gerçek zamanlı sesli konuşma — ses girdisi ve ses çıktısı, ara metin adımı olmadan
- **Gemini 2.0**: Canlı ses ve video akışı

## Görsel Anlamanın Sezgiye Aykırı Gerçeği

İşte şaşırtıcı olan: modeller görüntüleri *tanımlayabilir* ama her zaman *anlayamaz*. Bir fotoğrafta "kırmızı elbiseli kadın köpeği gezdiriyor" diyebilir ama "kadının neden endişeli göründüğünü" ya da "bu sahnenin neden komik olduğunu" her zaman kavrayamaz.

Bu, dil modellerinin görme yeteneğinin temelde *dildeki görme bilgisinden* geldiğini gösterir — milyonlarca alt yazı, açıklama ve görüntü-metin çiftinden. Gerçek görsel muhakeme (uzamsal ilişkiler, fizik sezgisi, sosyal bağlam) hâlâ zorlayıcı.

## Video: Şimdilik Son Sınır

Video anlama en zorudur çünkü zamansal boyut ekler. Tek bir 10 saniyelik klip yüzlerce "kare" içerir. Tüm kareleri token olarak işlemek hesaplama açısından felaket.

Çözümler: anahtar kare örnekleme, video sıkıştırma, zamansal dikkat mekanizmaları. Gemini 1.5 Pro 1 saatlik videoyu bağlam penceresinde işleyebilir — ama maliyeti yüksek.

## Çok Modluluk Nereye Gidiyor

- **Omni modeller**: Tek model metin, görüntü, ses, video girdi/çıktı — GPT-4o bunun ilk örneği
- **Robotik**: Dil modelleri fiziksel dünyada eylem planlama
- **Bilimsel**: Protein yapısı, molekül tasarımı, hava tahmini
- **Üretken**: Metin→görüntü (DALL-E, Midjourney), metin→video (Sora, Kling)

---

*Yarın modellere harici bellek vermeyi keşfedeceğiz: **RAG — Erişim-Artırılmış Üretim.***

---

<a href="quizzes/day-21.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 21 Quizini Çöz →</a>
