# Gün 19: Çıkarım Optimizasyonu — KV Önbellek, Spekülatif Kod Çözme ve Niceleme

*70 milyar parametreli bir modelden tek bir token üretmek neden matematik yapmaya değil, kütüphane kitabının gelmesini beklemeye benzer.*

---

## Kirli Sır: Çıkarım Bellek-Sınırlıdır

LLM çıkarımının en şaşırtıcı gerçeği: darboğaz hesaplama değil, **bellek bant genişliğidir**. BF16'da 70B modelin ağırlıkları 140GB yer kaplar. Tek bir token üretmek için tüm ağırlıkların bellekten okunması gerekir. H100'ün bellek bant genişliği 3,35 TB/s olduğundan, sadece ağırlıkları okumak ~42ms sürer — ve bu sürede GPU'nun hesaplama kapasitesinin çok küçük bir kısmı kullanılır.

Bu **bellek-sınırlı** olmanın anlamı: GPU'ya daha fazla hesaplama gücü eklemek yardımcı olmaz. İhtiyacınız olan daha hızlı bellek ya da daha küçük model.

## KV Önbellek: Bellek Karşılığında Zaman

Otoregresif üretimde her yeni token üretildiğinde modelin tüm önceki token'ların anahtar ve değer vektörlerini yeniden hesaplaması gerekirdi. **KV önbellek** (Key-Value cache) bunu çözer: her katmanın K ve V vektörlerini saklar ve yeni token'da sadece yeni K, V hesaplanır.

Sorun: KV önbellek devasa olabilir. 70B model, 128K bağlam, 80 katman, 128 baş, baş başına 128 boyut = **yaklaşık 40GB** sadece KV önbellek için. Bu, bir GPU'nun belleğinin yarısı!

KV önbellek optimizasyonları:
- **Gruplu Sorgu Dikkati (GQA)**: Sorgu başlarını anahtar-değer gruplarıyla paylaştırarak KV önbelleği 4-8 kat küçültür. Llama 2 70B ve sonraki modellerin çoğu GQA kullanır.
- **Çok-Sorgu Dikkati (MQA)**: Tek bir K-V çifti tüm sorgu başları tarafından paylaşılır — daha da agresif sıkıştırma.
- **KV önbellek niceleme**: KV vektörlerini 4-bit ya da 8-bit'e niceleme.

## Niceleme: Kontrollü Kabalaştırma Sanatı

Modelin ağırlıklarını 16-bit (BF16) yerine daha düşük hassasiyette saklamak bellek ve bant genişliği gereksinimlerini dramatik biçimde azaltır.

- **INT8 niceleme**: Ağırlıkları 8-bit tam sayılara dönüştürür. Bellek yarıya iner, kalite kaybı minimal.
- **INT4 / GPTQ / AWQ**: 4-bit niceleme. 70B model ~35GB'a sığar — tek bir A100 80GB'da çalışabilir. Kalite kaybı ölçülebilir ama çoğu görev için kabul edilebilir.
- **GGUF / llama.cpp**: Tüketici donanımında model çalıştırmak için optimize edilmiş formatlar. MacBook'ta Llama 3 8B çalıştırmak artık mümkün.

> 💡 **Niceleme nasıl çalışır?** Düşünün ki her ağırlık 16-bit hassasiyette 65.536 farklı değer alabilir. 4-bit'e nicelediğinizde sadece 16 farklı değere indirirsiniz. Hile, bu 16 değeri en az bilgi kaybıyla seçmektir.

## Spekülatif Kod Çözme: İşe Yaramaması Gereken Numara

**Spekülatif kod çözme** şaşırtıcı bir fikir: küçük, hızlı bir "taslak" model birden fazla token tahmin eder, sonra büyük model bu tahminleri *paralel olarak* doğrular. Doğru tahminler kabul edilir, yanlış olanlar düzeltilir.

Neden çalışır? Büyük model, n token'ı sıralı üretmek için n ileri geçiş gerektirir ama n token'ı paralel doğrulamak tek bir ileri geçişte mümkündür. Taslak model tahminlerin %60-80'ini doğru yaparsa, etkin hız 2-3 kat artar.

## Modern Çıkarım Altyapısı

Pratikte tüm bu teknikler birleştirilir:
- **vLLM**: PagedAttention ile verimli KV önbellek yönetimi — bellek parçalanmasını ortadan kaldırır
- **TensorRT-LLM** (NVIDIA): GPU'ya özgü kernel optimizasyonları
- **Sürekli gruplama**: Farklı istekleri aynı GPU'da dinamik olarak gruplama
- **Ön dolgu/üretim ayrımı**: İstemin işlenmesi (ön dolgu) ve token üretimi farklı optimize edilir

## Her Şeyi Yönlendiren Ekonomi

Çıkarım maliyeti token başına ölçülür. 2026 başı itibariyle:
- GPT-4o: girdi $2,50/M token, çıktı $10/M token
- Claude 3.5 Sonnet: girdi $3/M, çıktı $15/M
- Llama 3 70B (kendi barındırma): ~$0,50/M token (donanım amorti edildiğinde)
- GPT-4o-mini: girdi $0,15/M, çıktı $0,60/M

Bu fiyatlar 2023'ten 10-50 kat düştü — Moore Yasası benzeri bir eğri.

---

*Yarın ağırlığının üstünde yumruk atan küçük modelleri keşfedeceğiz: **Damıtma, Budama ve LoRA.***

---

<a href="quizzes/day-19.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 19 Quizini Çöz →</a>
