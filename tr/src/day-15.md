# Gün 15: GPT Serisi — Karşılığını Veren Ölçekleme Bahsi

*Küçük bir ekibin "sadece daha büyük yap" bahsının işe yaracağı inancı, mütevazı 117 milyon parametreli bir deneyi trilyon parametreli bir imparatorluğa nasıl dönüştürdü — ve yol boyunca tüm teknoloji endüstrisini nasıl yeniden şekillendirdi.*

---

## GPT-1: Kavram İspatı (Haziran 2018)

OpenAI'dan Alec Radford ve meslektaşları GPT-1'i yayınladığında, makale sektörü sarsmadı. 117 milyon parametre. BookCorpus üzerinde eğitilmiş (~985 milyon token). Fikir basitti: denetimli görevlere özgü eğitim yerine, genel amaçlı dil modelleme ön eğitimi yapıp sonra ince ayarlayın.

GPT-1, 12 NLP ölçütünün 9'unda en iyi sonuçları elde etti. Ama asıl katkısı sonuçlar değildi — *felsefeydi*: denetimli eğitim yerine denetimsiz ön eğitim + ince ayar yeterlidir.

## GPT-2: "Yayınlamak İçin Çok Tehlikeli" (Şubat 2019)

GPT-2, 1,5 milyar parametreye ölçeklendi ve en az 3 karma alan Reddit gönderilerinden bağlanan 40GB web metni (WebText) üzerinde eğitildi. OpenAI, güvenlik endişeleri nedeniyle tam modeli yayınlamadı — bu karar büyük tartışma yarattı.

GPT-2'nin gerçek yeniliği **sıfır-örnekli görev transferiydi**. Hiç ince ayar yapılmadan, doğru formatta istem vererek özet çıkarma, çeviri ve soru yanıtlama yapabiliyordu. Bu, ölçeğin yetenek yaratığının ilk net göstergesiydi.

## GPT-3: Bağlam İçi Öğrenme Devrimi (Haziran 2020)

GPT-3 her şeyi değiştirdi. 175 milyar parametre. 300 milyar token eğitim verisi. Tahmini 4,6 milyon dolar hesaplama maliyeti. Ve **az-örnekli bağlam içi öğrenme** keşfi — birkaç örnek vererek modeli yeni görevlere yönlendirebilme.

GPT-3 bir API olarak sunuldu ve yapay zekâ startup ekosistemini doğurdu. Jasper, Copy.ai, Writesonic gibi düzinelerce şirket GPT-3 API'si üzerine ürünler kurdu.

## GPT-3.5 ve ChatGPT: Ürün Atılımı (Kasım 2022)

ChatGPT'nin lansmanı belki de teknoloji tarihindeki en hızlı tüketici benimsenmesiydi — 5 günde 1 milyon, 2 ayda 100 milyon kullanıcı. Teknik olarak GPT-3.5, GPT-3'ten dramatik bir sıçrama değildi — RLHF ile ince ayar yapılmış ve kod verisiyle güçlendirilmişti. Ama *ürün olarak* devrimciydi.

ChatGPT, yapay zekâ yarışını ateşledi. Google "kırmızı kod" ilan etti. Microsoft, OpenAI'a 10 milyar dolar yatırdı. Her büyük teknoloji şirketi yapay zekâ stratejisini yeniden değerlendirdi.

## GPT-4: Uzmanlar Karışımı Hamlesi (Mart 2023)

GPT-4 sessizce devrim yaptı. OpenAI, mimari ayrıntılarını açıklamadı ama sektör sızıntıları 8 uzman, her biri ~220 milyar parametre olmak üzere toplam ~1,8 trilyon parametreli Uzmanlar Karışımı (MoE) modeli olduğunu gösterdi. Her token sadece ~280B parametreyi aktive eder.

GPT-4 çok modlu olarak piyasaya çıktı — görüntü girdisi kabul ediyor. Baro sınavında 90. yüzdelik, tıp sınavlarında uzman düzeyi, kodlama ölçütlerinde çarpıcı performans. Yapay zekâ "ilginç demo"dan "ciddi araç"a geçtiğinin ispatıydı.

## GPT-4'ün Ötesi: Sayılar Sonrası Çağ (2024-2026)

OpenAI'ın stratejisi değişti. GPT-4o, GPT-4o-mini, o1, o1-pro, o3 — isimler artık sıralı sayılar değil, ürün aileleri. Odak "daha büyük" yerine "daha akıllı ve daha verimli" ve "muhakeme zamanı hesaplama" oldu.

o1 serisi (2024-2025) test zamanı hesaplama ölçeklemesini tanıttı — model yanıt vermeden önce "düşünür" ve gizli muhakeme token'ları üretir. Bu, Gün 28'de derinlemesine inceleyeceğimiz yeni bir ölçekleme ekseni.

## Meta-Hikâye: GPT Serisi Gerçekte Neyi Kanıtladı

GPT serisi tek bir derin gerçeği kanıtladı: **basit bir hedefi (sonraki token tahmini) yeterince büyük ölçekte uygularsanız, karmaşık zekâ ortaya çıkar**. Özel mimari yeniliklere, göreve özgü modüllere ya da insan tarafından kodlanmış bilgiye gerek yok. Sadece ölçek.

Bu felsefi açıdan derin ve tartışmalı. "Ama gerçekten anlıyor mu?" sorusu devam ediyor. Pratik cevap: baro sınavını geçiyorsa, fark önemli mi?

---

*Yarın diğer laboratuvarların GPT'den nasıl ayrıştığını keşfedeceğiz: Claude, Gemini, Llama — her biri farklı yollar izleyerek ve bazen daha iyi yollar bularak.*

---

## 📝 Gün 15 Quiz

<a href="quizzes/day-15.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 15 Quizini Çöz →</a>
