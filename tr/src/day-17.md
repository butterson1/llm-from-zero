# Gün 17: Uzmanlar Karışımı — Seyrek Modeller Nasıl Hesaplama Maliyeti Olmadan Büyür

*Dünyanın en güçlü dil modellerinin arkasında kirli bir sır var: parametrelerin çoğu herhangi bir girdide hiçbir şey yapmıyor.*

---

## İmkânsız Ödünleşim

Ölçekleme yasaları bize daha büyük modellerin daha iyi olduğunu söylüyor. Ama büyük modeller pahalı — hem eğitimde hem çıkarımda. 1 trilyon parametreli yoğun bir model her token için tüm 1 trilyon parametreyi kullanır. İşte Uzmanlar Karışımı (MoE) bu çıkmazı kırar: **toplam parametre sayısını artırın ama her token için sadece bir kısmını aktive edin**.

## Temel Fikir: Koşullu Hesaplama

MoE'nin çekirdek fikri basit: standart ileri beslemeli ağı birden fazla "uzman" ağla değiştirin ve bir **yönlendirici** (router) her token için hangi uzmanların aktive olacağına karar versin.

Standart Transformer bloğunda her token aynı FFN'den geçer. MoE bloğunda token, yönlendiriciye gider; yönlendirici 8 (ya da 16, 64...) uzman arasından en uygun 2'yi seçer ve sadece onları aktive eder. Sonuçlar ağırlıklı olarak birleştirilir.

Sonuç: 8 uzmanlık MoE model, tekli yoğun modelin 8 katı toplam parametreye sahip olabilir ama token başına hesaplama maliyeti yaklaşık aynıdır — çünkü her seferinde sadece 2 uzman çalışır.

## Yönlendirici: Sihrin (ve Sorunun) Olduğu Yer

Yönlendirici, token'ın gömmesini alır ve her uzmana bir "uygunluk puanı" atar. En yüksek puanlı top-k uzman aktive edilir.

Sorun: **yük dengesizliği**. Yönlendirici eğitim sırasında bazı uzmanları tercih etmeyi öğrenebilir, diğerlerini atıl bırakarak. Bu, toplam parametrelerin sadece bir kısmının etkili olması demek. Çözüm: **yük dengeleme kaybı** — yönlendiriciyi token'ları uzmanlar arasında eşit dağıtmaya teşvik eden ek bir kayıp terimi.

## MoE Modellerini Eğitmek: Göründüğünden Zor

MoE eğitiminin zorlukları:
- **Yönlendirici kararsızlığı**: Yönlendirici erken eğitimde dengesiz kararlar verebilir
- **İletişim maliyeti**: Uzmanlar farklı GPU'larda olduğunda token'ları doğru uzmana yönlendirmek ağ trafiği yaratır
- **Bellek**: Toplam parametre sayısı büyük olduğu için tüm uzmanlar bellekte tutulmalı
- **Eğitim kararsızlığı**: MoE modeller yoğun modellerden daha kırılgan olabilir

## MoE'nin Gerçek Dünya Örnekleri

**GPT-4** (söylentilere göre): 8 uzman × ~220B parametre = ~1,8T toplam, token başına ~280B aktif
**Mixtral 8x7B** (Mistral): 8 uzman × 7B, toplam ~47B parametre, token başına ~13B aktif — Llama 2 70B'ye yakın performans, çok daha düşük çıkarım maliyetiyle
**DeepSeek-V2**: 236B toplam parametre, ama sadece 21B aktif — dikkate değer verimlilik

> 💡 **Basit benzetme:** MoE'yi çok branşlı bir hastane gibi düşünün. Hasta (token) geldiğinde resepsiyonist (yönlendirici) uygun uzman doktora (expert) yönlendirir. Tüm doktorlar maaş alır (bellekte yer kaplar) ama aynı anda sadece birkaçı çalışır.

## Çıkarımda MoE: Tasarrufların Gerçekleştiği Yer

MoE'nin gerçek avantajı çıkarımda ortaya çıkar. Token başına daha az hesaplama = daha hızlı yanıt + daha düşük maliyet. Ama bir karmaşıklık var: tüm uzmanların bellekte yüklü olması gerekir (token hangi uzmana gideceği önceden bilinmez). Bu yüzden MoE modellerin toplam bellek ayak izi büyük, ama hesaplama ayak izi küçüktür.

## Sınır: MoE Nereye Gidiyor

- **Daha ince taneli yönlendirme**: Token başına 2 yerine 1 uzman, ya da uzman içi dikkat mekanizmaları
- **Daha fazla uzman**: DeepSeek-V3 yüzlerce küçük uzman kullandı
- **Uzman budama**: Çıkarım sırasında az kullanılan uzmanları bellekten çıkarma
- **Heterojen uzmanlar**: Farklı boyutlarda uzmanlar — bazıları küçük ve hızlı, bazıları büyük ve derin

---

*Yarın modellerin nasıl giderek daha uzun metinleri okuyup anlayabildiğini keşfedeceğiz: **Bağlam Pencereleri** — 512 token'dan 1 milyon+ token'a.*

---

## 📝 Quiz

<a href="quizzes/day-17.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 17 Quizini Çöz →</a>
