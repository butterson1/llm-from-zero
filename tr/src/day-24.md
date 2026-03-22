# Gün 24: Kod Üretimi — Copilot, Codex ve Neden Kod Katil Uygulamadır

*Kod, dil modellerinin sadece akıllı görünmediği — kanıtlanabilir biçimde akıllı olduğu tek alan. Her öneri ya derlenir ya derlenmez. Her fonksiyon ya çalışır ya çöker. Ve bu acımasız dürüstlük, programlamayı LLM'lerin şimdiye kadarki en dönüştürücü uygulamasına çevirdi.*

---

## Tuhaf Yakınsama

Kod üretimi üç nedenden dolayı LLM'ler için ideal:

### Neden 1: Kod Doğrulanabilir
Doğal dilde "iyi bir yanıt" özneldir. Kodda testler geçer ya da geçmez, program çalışır ya da çöker. Bu kesin geri bildirim döngüsü hem eğitimi hem değerlendirmeyi kolaylaştırır.

### Neden 2: Kodun Dünyanın En İyi Eğitim Verisi Var
GitHub 100 milyondan fazla depo barındırır. Her depo fonksiyon tanımları, belgeler, testler, kod incelemeleri ve commit geçmişi içerir — doğal olarak yapılandırılmış, yüksek kaliteli eğitim verisi.

### Neden 3: Yatırım Getirisi Hemen Belli
Bir geliştirici saatte 50 dolar kazanıyorsa ve yapay zekâ verimliliğini %30 artırıyorsa, tasarruf hemen ölçülebilir. Bu, kurumsal benimsemeyi hızlandırır.

## Kod Üretiminin Mimarisi

Modern kod asistanları birden fazla modeli ve tekniği birleştirir:
- **Otomatik tamamlama**: İmleç konumunda sonraki kod satırlarını tahmin etme (FIM — Fill-in-the-Middle eğitimi)
- **Sohbet tabanlı**: Doğal dilde "bu fonksiyonu yaz" talimatı
- **Bağlam toplama**: Açık dosyalar, proje yapısı, bağımlılıklar, LSP bilgisi
- **Ajansal**: Çok dosyalı değişiklikler, test yazma, hata ayıklama döngüsü

## Otomatik Tamamlamadan Otonom Kodcuya

Evrim hızlı oldu:
- **GitHub Copilot** (2021): İlk yaygın kod asistanı, VS Code eklentisi
- **ChatGPT** (2022): Sohbet tabanlı kodlama yardımı
- **Cursor** (2023-2024): Editör düzeyinde yapay zekâ entegrasyonu
- **Devin** (2024): İlk "yapay zekâ yazılım mühendisi" ajanı
- **Claude Code / Codex** (2025): Terminal tabanlı kodlama ajanları

HumanEval (164 programlama problemi) ölçütünde ilerleme:
- Codex (2021): %28,8
- GPT-4 (2023): %67
- Claude 3.5 Sonnet (2024): %92
- o1/o3 (2025): %96+

## Yapay Zekâ Üretimi Kodun Şaşırtıcı Ekonomisi

GitHub Copilot kullanıcıları %55'e kadar daha hızlı kod tamamlama bildiriyor. McKinsey araştırması (2023) yazılım geliştirme görevlerinde %20-45 verimlilik artışı tahmin ediyor.

Ama bir uyarı: yapay zekâ üretimi kod her zaman doğru değil. "Çalışıyor gibi görünen ama ince hatalar içeren" kod üretme riski gerçek. Deneyimli geliştiriciler yapay zekâdan daha fazla yararlanır çünkü hataları fark edebilir.

---

*Yarın yapay zekânın ekonomisine bakacağız: çıkarım maliyetleri, API fiyatlandırması ve kim para kazanıyor.*

---

<a href="quizzes/day-24.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 24 Quizini Çöz →</a>
