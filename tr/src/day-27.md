# Gün 27: Riskler — Halüsinasyon, Kötüye Kullanım, Deepfake'ler ve Varoluşsal Kaygılar

*Transistörden bu yana en yetenekli teknoloji aynı zamanda ikna edici biçimde yalan söylüyor, fotogerçekçi sahte üretiyor ve — doğru insanlara sorarsanız — insan uygarlığına tehdit oluşturabilir. Zor kısım riskleri listelemek değil. Hangilerinin gerçek olduğunu bulmak.*

---

## Kendi Yalanlarına İnanan Makine

**Halüsinasyon** LLM'lerin en temel ve en yaygın risk kaynağı. Model, eğitim verisinde olmayan ama makul görünen bilgiyi güvenle üretir. Bu "yalan söylemek" değil — model doğru ve yanlış arasında ayrım yapmıyor, sadece en olası sonraki token'ı tahmin ediyor.

Halüsinasyon örnekleri:
- Var olmayan akademik makaleler (sahte DOI'ler dahil)
- Yanlış tarihsel olaylar
- Gerçek olmayan yasal emsal kararlar (bir avukatın ChatGPT'den alıntıladığı sahte davalar)
- Uydurma istatistikler

Azaltma yöntemleri:
- **RAG** (Gün 22): Modeli doğrulanabilir kaynaklara dayandırma
- **Alıntı zorunluluğu**: Modelden kaynak göstermesini isteme
- **Güven kalibrasyonu**: Modelin emin olmadığında "bilmiyorum" demesi
- **Çıktı doğrulama**: İkinci bir model ya da kural tabanlı sistem

> 💡 **Halüsinasyon neden tamamen çözülemez?** Temelde, sonraki-token tahmini doğruluğu garanti etmez. Model "Paris Fransa'nın başkentidir" ve "Mars'ın başkenti Olympus Mons'tur" arasında aynı mekanizmayı kullanır — ikisi de istatistiksel olarak "makul" görünür.

## Kötüye Kullanım Spektrumu

Yapay zekâ kötüye kullanımı bir spektrumdadır:

**Düşük teknik bariyer** (bugün gerçekleşiyor):
- Toplu spam ve kimlik avı e-postaları
- Ödev yazma ve akademik sahtekârlık
- Sosyal mühendislik ölçekleme

**Orta teknik bariyer:**
- Deepfake ses ve video (seçim manipülasyonu, dolandırıcılık)
- Otomatik dezenformasyon kampanyaları
- Zararlı içerik üretimi

**Yüksek teknik bariyer** (henüz spekülatif):
- Siber silah geliştirmede yardım
- Biyolojik/kimyasal silah bilgisine erişim kolaylaştırma
- Otonom siber saldırılar

## Varoluşsal Soru

Yapay zekâ "varoluşsal risk" tartışması iki uç arasında sallanıyor:

**Endişeli kamp** (Hinton, Bengio, Anthropic, bazı OpenAI araştırmacıları): Yeterince yetenekli yapay zekâ sistemleri insan kontrolünden çıkabilir. Hizalama problemi çözülmeden ölçekleme tehlikelidir. "Süper zekâ" insanların çıkarlarıyla uyumlu olmayabilir.

**Şüpheci kamp** (LeCun, birçok akademisyen): Mevcut LLM'ler "gerçek" anlama ya da ajanlığa sahip değil. Varoluşsal risk tartışması, bugünkü gerçek zararlardan (önyargı, dezenformasyon, iş kaybı) dikkati dağıtıyor. Düzenleme, spekülatif gelecek yerine bugünkü sorunlara odaklanmalı.

**Orta yol**: Her iki perspektif de değerli. Bugünkü riskler (halüsinasyon, önyargı, kötüye kullanım) acil ve gerçek. Gelecekteki riskler (kontrol kaybı) belirsiz ama yüksek etkili. İkisine de hazırlanmak gerekir.

## Gerçekten Önemli Risk Taksonomisi

Pratik bir çerçeve:

1. **Güvenilirlik riskleri** (bugün): Halüsinasyon, tutarsızlık, kırılganlık. Her gün kullanıcıları etkiliyor.
2. **Kötüye kullanım riskleri** (bugün+yakın gelecek): Dezenformasyon, dolandırıcılık, gizlilik ihlali.
3. **Sistemik riskler** (orta vadeli): İş piyasası dönüşümü, güç yoğunlaşması, dijital bölünme.
4. **Varoluşsal riskler** (uzun vadeli, belirsiz): Kontrol kaybı, hizalama başarısızlığı.

## Ne Yapılıyor

- **AB Yapay Zekâ Yasası** (2024): Risk tabanlı düzenleme çerçevesi
- **ABD Yürütme Emri** (Ekim 2023): Büyük eğitim süreçleri için raporlama gereksinimleri
- **Gönüllü taahhütler**: Frontier Model Forum, büyük şirketlerin güvenlik taahhütleri
- **Kırmızı takım**: Model yayınlanmadan önce kapsamlı güvenlik testleri
- **Watermark**: Yapay zekâ üretimi içeriği işaretleme teknikleri

---

*Yarın son dersimiz — ve belki de en heyecanlısı: **Sırada Ne Var — Test Zamanı Hesaplama, Muhakeme Modelleri ve YGZ'ye Giden Yol.***

---

<a href="quizzes/day-27.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 27 Quizini Çöz →</a>
