# Gün 18: Bağlam Pencereleri — 512'den 1M+ Token'a

*Transformer'lar bütün romanları okumayı nasıl öğrendi ve bunu mümkün kılan güzel matematik.*

---

## Dikkatin İlk Günahı

Gün 3'ten hatırlayın: öz-dikkat O(n²) karmaşıklığa sahip — her token diğer her token'a dikkat eder. 512 token'la bu sadece ~262K işlem. Ama 100K token'la bu ~10 milyar işlem. 1M token'la ~1 trilyon. Karesel ölçekleme bir duvardır.

Orijinal Transformer (2017) 512 token'lık bağlam penceresiyle çalışıyordu. GPT-2 bunu 1.024'e çıkardı. GPT-3 2.048, sonra 4.096. Ama gerçek atılımlar 2023-2024'te geldi.

## Konum Problemi: Transformer Nerede Olduğunu Nasıl Bilir?

Gün 3'te gördüğümüz gibi öz-dikkatin konum kavramı yok — konumsal kodlamalar eklenmeli. Orijinal sinüzoidal kodlamalar sabit uzunluk için tasarlanmıştı. Daha uzun bağlam için yeni yöntemler gerekti.

## RoPE: Dönerek Daha Uzun Bağlama

**Rotary Position Embedding (RoPE)**, Su ve ark. (2021) tarafından tanıtıldı ve modern uzun bağlam modellerinin temeli oldu. RoPE, her pozisyondaki sorgu ve anahtar vektörlerini pozisyona bağlı bir açıyla döndürür. İki token arasındaki dikkat puanı sadece *göreli konumlarına* bağlıdır — mutlak konuma değil.

RoPE'un güzelliği: eğitim sırasında görülenden daha uzun dizilere *genellenebilir*. "YaRN" (Yet Another RoPE Extension) gibi tekniklerle RoPE frekanslarını ayarlayarak eğitim bağlamının 4-8 katına kadar genişletilebilir.

Llama, Mistral, Qwen ve çoğu modern açık model RoPE kullanır.

## ALiBi: Neredeyse Kazanan Doğrusal Önyargı

**ALiBi** (Attention with Linear Biases, Press ve ark., 2022) daha basit bir yaklaşım benimsedi: konum bilgisini dikkat puanlarına doğrusal bir önyargı olarak ekle. Uzak token çiftleri otomatik olarak daha düşük dikkat puanı alır. Zarif ve etkili ama RoPE kadar yaygınlaşmadı.

## Ring Attention: İmkânsızı Dağıtmak

1M token'lık bir dizide dikkat matrisini tek bir GPU belleğine sığdıramazsınız. **Ring Attention** (Liu ve ark., 2023) çözümü: diziyi parçalara böl, her parçayı farklı GPU'ya ver ve dikkat hesaplamasını "halka" şeklinde GPU'lar arasında döndür. Her GPU bir seferde dizinin sadece bir parçasına dikkat eder.

Bu teknik Gemini 1.5'in 1M+ token bağlamını mümkün kıldı.

## FlashAttention: GPU Fısıldayıcısı

**FlashAttention** (Dao ve ark., 2022) algoritmik değil *donanım* düzeyinde bir devrimdi. Standart dikkat uygulaması büyük ara matrisleri GPU ana belleğine yazar ve geri okur — bu çok yavaş. FlashAttention dikkat hesaplamasını GPU'nun hızlı SRAM'ında *yerinde* yaparak bellek trafiğini 5-10 kat azaltır.

FlashAttention, aynı donanımda 2-4 kat daha hızlı dikkat hesaplama sağlar ve *daha az bellek* kullanır. Pratikte her modern LLM FlashAttention veya türevlerini kullanır.

## İğne Samanlıkta: Modeller Uzun Bağlamı Gerçekten *Kullanabilir* mi?

Bağlam penceresinin büyük olması, modelin tüm bağlamı etkili kullandığı anlamına gelmez. **Needle-in-a-Haystack** testi — uzun bir metnin ortasına gizlenmiş tek bir gerçeği bulma — modellerin uzun bağlam yeteneklerini test eder.

Sonuçlar karışık. Çoğu model metnin başını ve sonunu iyi hatırlar ama **ortayı** kaçırır — "ortada kaybolma" problemi. Bu, dikkatin birincillik ve yenilik önyargısından kaynaklanır. Gemini 1.5 Pro ve Claude 3 bu konuda en iyi performans gösteren modeller arasında.

## Uzun Bağlamın Şaşırtıcı Ekonomisi

Daha uzun bağlam = daha pahalı çıkarım. 128K token bağlamla KV önbellek devasa büyür (Gün 19). Ama uzun bağlam aynı zamanda RAG'ı (Gün 22) basitleştirir: belgeyi direkt bağlama koyabilirsiniz.

---

*Yarın çıkarım optimizasyonunun derinliklerine dalacağız: **KV Önbellek, Spekülatif Kod Çözme ve Niceleme.***

---

<a href="quizzes/day-18.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 18 Quizini Çöz →</a>
