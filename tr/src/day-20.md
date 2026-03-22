# Gün 20: Ağırlığının Üstünde Yumruk Atan Küçük Modeller — Damıtma, Budama ve LoRA

*Yapay zekâ dünyası beyin kas yerine zekâ olduğunu nasıl öğrendi — ve 2025'in en önemli modelleri neden en büyükler olmayabilir.*

---

## Daralan Zekânın Paradoksu

Ölçekleme yasaları büyük modellerin daha iyi olduğunu söylüyor. Ama dağıtım ekonomisi küçük modellerin daha pratik olduğunu söylüyor. Bu gerilim, modelleri küçültürken zekâyı koruma tekniklerini doğurdu.

## Bilgi Damıtma: Öğretmen-Öğrenci Protokolü

**Bilgi damıtma** (Hinton ve ark., 2015) büyük bir "öğretmen" modelin bilgisini küçük bir "öğrenci" modele aktarır. Öğrenci, öğretmenin çıktı dağılımını (sadece doğru cevabı değil, tüm olasılık dağılımını) taklit etmeye eğitilir.

Neden işe yarar? Öğretmenin çıktı dağılımı "yumuşak etiketler" içerir — sadece doğru cevabın değil, hangi yanlış cevapların "neredeyse doğru" olduğunun bilgisini. "Paris" doğru cevapsa, öğretmenin "Lyon"a da biraz olasılık vermesi öğrenciye coğrafi bilgi aktarır.

Modern örnekler:
- **Phi serisi** (Microsoft): GPT-4'ten sentetik veri üreterek küçük modelleri eğitme
- **Orca**: GPT-4'ün düşünce zincirleri üzerinde eğitilerek muhakeme aktarımı
- **Gemma** (Google): Gemini'den damıtılmış küçük modeller

## Budama: Yapay Beyinlerin Nörobilimi

İnsan beyni gelişim sırasında sinaptik budama yapar — az kullanılan bağlantılar zayıflar ve kaybolur. Benzer şekilde, nöronal budama modeldeki gereksiz parametreleri çıkarır.

- **Yapılandırılmamış budama**: Bireysel ağırlıkları sıfırlama (küçük değerli ağırlıklar genellikle gereksiz)
- **Yapılandırılmış budama**: Tam dikkat başlarını ya da FFN nöronlarını çıkarma
- **SparseGPT**: Tek geçişte büyük modelleri budayarak %50-60 seyreklik, minimal kalite kaybı

## LoRA: Cerrahi İnce Ayar Devrimi

Gün 10'da detaylı incelediğimiz LoRA burada tekrar karşımıza çıkıyor çünkü küçük model paradigmasının merkezinde. LoRA adaptörleri sayesinde tek bir temel model üzerinde düzinelerce uzmanlık çalıştırılabilir.

## Yakınsama: Teknikleri Birleştirmek

En etkili küçük modeller birden fazla tekniği birleştirir:
1. Büyük modelden **damıtma** ile eğitim verisi üret
2. **Yoğun eğitim**: Chinchilla-optimal'in çok üstünde veri kullan (Llama 3 8B: 15T token)
3. **Niceleme** ile dağıtım boyutunu küçült
4. **LoRA** ile görev-specifik adaptasyon

Sonuç: 2024-2025'in en etkili modelleri genellikle 7-13B parametre aralığında — telefonlarda, dizüstü bilgisayarlarda ve tek GPU'larda çalışabilen boyutlar.

## Neden Önemli: Demokratikleştirme Argümanı

Küçük modeller yapay zekâ erişimini demokratikleştirir:
- **Gizlilik**: Veri buluttan çıkmaz
- **Maliyet**: GPU kiralama yerine yerel donanım
- **Gecikme**: Ağ gecikmesi yok
- **Bağımsızlık**: API sağlayıcıya bağımlılık yok

> 💡 **Türkiye'de pratik etkisi**: Küçük modeller, yerel işletmelerin ve geliştiricilerin yapay zekâ kullanımını dolar bazlı API maliyetlerinden bağımsızlaştırır. Llama 3 8B bir RTX 4090'da rahatlıkla çalışır — bu, Türkçe'ye özel uygulamalar geliştirmek için yeterli.

---

*Yarın görüntü, ses ve birleşik zekâya giden yolu keşfedeceğiz: **Çok Modlu Modeller.***

---

<a href="quizzes/day-20.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 20 Quizini Çöz →</a>
