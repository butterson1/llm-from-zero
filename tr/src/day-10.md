# Gün 10: İnce Ayar ve Transfer Öğrenme — Temel Modeli Uyarlama

*Dün sosis yapımını izlediniz: trilyonlarca token kazınıp, filtrelenip, tekilleştirilip, devasa maliyetle transformer'lara beslendi. Sonuç bir temel model — insan metninin dev bir istatistiksel aynası. Ama mesele şu: o ayna her şeyi yansıtıyor, yani hiçbir şeyi özel olarak yansıtmıyor. Ham ön eğitimli bir modele tıbbi soru sorun ve bir Wikipedia makalesi yazmaya devam edebilir, ya da bir Reddit dizisi üretebilir, ya da bir alıntı halüsinasyonu yapabilir, ya da şiir üretebilir. Bilgisi var. Yönü yok. Bugün alanın bu canavarları nasıl yönlendirmeyi öğrendiğini keşfediyoruz — ucuzca, hızlıca ve çarpıcı bir etkililikle — ince ayar ve transfer öğrenme aracılığıyla.*

---

## Her Şeyi Değiştiren Kavrayış: Özellikler Transfer Olur

LLM'lerden bahsetmeden önce 2014'e ve Cornell'deki Jason Yosinski adlı doktora öğrencisine dönmemiz gerekiyor. Yosinski ImageNet üzerinde eğitilmiş evrişimli sinir ağlarıyla bir deney yaptı. Bir ağı ikiye böldü ve sordu: alt katmanları dondurur ve sadece üsttekileri yeniden eğitirseniz performans ne kadar düşer? Cevap dikkat çekiciydi. **İlk katmanlar neredeyse evrensel özellikler öğrenmişti** — kenar algılayıcılar, renk lekeleri, doku kalıpları — çılgınca farklı görevlere aktarılabilen. Sonraki katmanlar uzmanlaştı. Köpek fotoğrafları üzerinde eğitilmiş bir ağı sadece son katmanları değiştirerek uydu görüntüleri için kullanabilirdiniz.

Bu transfer öğrenme idi: bir görevde öğrenilen temsillerin diğerlerine aktarıldığı farkındalık. Bilgisayarlı görmede neredeyse bir gecede standart uygulama oldu. Sıfırdan eğitmek yerine ön eğitimli modeli ince ayar yapardınız. Eğitim maliyetleri 10-100 kat düştü.

Ama dil bu tedaviye yıllarca direndi. Atılım 2018'de geldi: **ULMFiT**, **ELMo** ve **BERT** — üçü de dil modellerinin ham metin üzerinde ön eğitilip bin kadar etiketli örnekle belirli görevlere ince ayar yapılabileceğini kanıtladı.

Alan "görev başına 100.000 etiketli örneğe ihtiyacınız var"dan "1.000 örnek ve bir ön eğitimli modele ihtiyacınız var"a geçti. Bu, iki yıldan kısa sürede tüm NLP endüstrisini yeniden şekillendiren muazzam bir verimlilik kazanımı.

## İnce Ayar Ağırlıklara Gerçekte Ne Yapar

Ön eğitimli bir dil modeli dikkat başları ve ileri beslemeli ağ katmanlarına dağılmış milyarlarca parametreye sahiptir. Ön eğitim sırasında bu parametreler dilin sıkıştırılmış bir temsilini kodlar: sözdizimi, olgular, muhakeme kalıpları, ton, stil. İnce ayar yaptığınızda, bu kontrol noktasının tamamını alıp çok daha küçük, çok daha hedefli bir veri kümesi üzerinde çok daha düşük öğrenme hızıyla eğitime devam edersiniz.

Şöyle düşünün. Ön eğitim araziyi inşa eder: dilbilgisi dağları, sağduyu vadileri, olgusal çağrışım nehirleri. İnce ayar araziyi buldozerlemez. Yol döşer. Dağ silsilesi kalır. Nehirler kalır. Ama artık modelin davranışını belirli hedeflere yönlendiren patikalar var — soruları yanıtlama, talimatları takip etme, belirli bir stilde kod yazma.

Pratik sonuç: ince ayar ucuzdur. Llama 3.1 405B'nin ön eğitimi Meta'ya tahminen **30,84 milyon GPU-saat** maliyete ulaşırken, aynı modeli birkaç yüz bin talimat örneği üzerinde ince ayar yapmak **birkaç yüz GPU-saat** sürebilir — ön eğitim bütçesinin kabaca %0,001'i. 7B modeli tek bir A100'de bir öğleden sonrada ince ayar yapabilirsiniz.

## Denetimli İnce Ayar: Talimat Devrimi

Modern LLM'ler için en erken ve en sonuç doğuran ince ayar biçimi **denetimli ince ayardır (SFT)**, bazen **talimat ayarı** da denir. Fikir: (istem, istenen yanıt) çiftlerinden oluşan bir veri kümesi toplayın ve modeli istem verildiğinde yanıtı üretmek için eğitin.

Temel çalışma Google'dan 2021'deki **FLAN**'dı (İnce Ayarlanmış Dil Ağı). 137B parametreli LaMDA modelini doğal dil talimatları olarak ifade edilmiş **62 NLP veri kümesi** üzerinde ince ayar yaptılar. İnce ayarlı model ham ön eğitimli modeli **hiç görmediği görevlerde** — üzerinde ince ayar yapılmamış görevlerde — geçti. Bu kilit sürprizdi: talimat ayarı modele sadece o 62 belirli görevi çözmeyi öğretmedi. Modele talimatları takip etme *meta-becerisini* öğretti.

OpenAI bunu 2022 başında **InstructGPT** ile daha ileri taşıdı. 40 insan etiketçi tutup gerçek kullanıcıların göndereceği türde sorguları kapsayan on binlerce istem-yanıt çifti yazdırdılar. Bu veri üzerinde ince ayar yapılmış 1,3B InstructGPT modeli, insan değerlendiriciler tarafından ham 175B GPT-3'e tercih edildi. Tekrar okuyun: **135 kat daha küçük bir model, yön almayı öğrenerek devi yendi.** Sektörün ön eğitimli modelin motor, ince ayarın ise direksiyon olduğunu fark ettiği an buydu.

## LoRA Devrimi: Parametrelerin %0,01'i ile İnce Ayar

Tam ince ayar modeldeki her parametreyi günceller. 70B model için 16-bit hassasiyette bu, bellekte iki kopya tutmak — parametreler ve gradyanları — artı optimize edici durumları, toplam kabaca **560 GB VRAM** demek.

2021'de Microsoft'tan Edward Hu ve meslektaşları **LoRA**'yı — Düşük-Rank Uyarlama — tanıttı. Temel kavrayış güzel biçimde basit. Büyük bir modele ince ayar yaptığınızda ağırlık güncellemeleri **düşük-ranklıdır**: tam parametre uzayının minik bir alt uzayını kaplar. Dolayısıyla W ağırlık matrisini doğrudan güncellemek yerine LoRA W'yi dondurur ve küçük bir dolambaç ekler: W + BA, burada B ve A rank r'li (tipik olarak 8-64) ince matrislerdir. 4096×4096 boyutlu bir ağırlık matrisi (yaklaşık 16,7 milyon parametre) için rank-16 LoRA sadece 2 × 4096 × 16 = **131.072 eğitilebilir parametre** ekler — orijinalin %1'inden az.

Sonuçlar şok ediciydi. LoRA ince ayarı, modelin parametrelerinin sadece **%0,01-0,1'ini** eğitirken neredeyse her ölçütte tam ince ayar performansına eşleşti. Bellek gereksinimleri 3-10 kat düştü. Eğitim süresi orantılı olarak düştü.

> 💡 **LoRA neden önemli?** Bu, yapay zekâ demokratikleşmesinin en somut adımlarından biri. Eskiden trilyonlarca parametreli modeli özelleştirmek dev kümelere ihtiyaç duyarken, LoRA sayesinde tek bir GPU'da birkaç saatte özelleştirebilirsiniz. Bu, küçük ekiplerin ve bireylerin yapay zekâ geliştirmesinin önünü açtı.

LoRA bir varyant ailesi doğurdu. **QLoRA** (2023) LoRA'yı donmuş temel ağırlıkların 4-bit nicelemesiyle birleştirerek 65B modelin **tek bir 48GB GPU'da** ince ayarını mümkün kıldı. **DoRA** (2024) ağırlık güncellemelerinin büyüklük ve yönünü ayırır ve genellikle vanilya LoRA'yı geçer.

Adaptör paradigması aynı zamanda uzmanlıkları yığabileceğiniz anlamına gelir. Hem hukuk analizi HEM de tıbbi soru-cevapda harika bir model mi istiyorsunuz? İki ayrı LoRA adaptörü eğitip çıkarım zamanında değiştirin. Temel model donmuş kalır.

## İnce Ayarın Yapabildiği ve Yapamadığı

**İnce ayarın başarılı olduğu:**
- **Format ve stil.** JSON'da yanıt verme, belirli şablon takip etme, kişilik benimseme, marka sesi eşleme.
- **Talimat takibi.** Ham dil modelini asistana dönüştüren SFT adımı.
- **Alan uzmanlığı.** Med-PaLM 2 tıbbi soru-cevap üzerinde ince ayar yapılarak ABD Tıp Lisans Sınavı'nda %86,5 elde etti. BloombergGPT finansal metin üzerinde eğitildi.
- **Davranışsal hizalama.** RLHF hattının ilk adımı olan SFT.

**İnce ayarın zorlandığı:**
- **Tamamen yeni bilgi ekleme.** Temel model tescilli bir iç sistem hakkında hiçbir şey görmediyse, birkaç bin örnek üzerinde ince ayar o sistemin ayrıntılarını güvenilir biçimde öğretmez. RAG (Gün 22) belirli bilgi enjeksiyonu için genellikle daha iyidir.
- **Derin kodlanmış önyargıları kaldırma.** İnce ayar belirli çıktıları bastırabilir ama altta yatan temsilleri silmez.
- **Güçlü öncülleri geçersiz kılma.** Model milyonlarca örnekten "Avustralya'nın başkenti Sidney'dir" öğrendiyse (yaygın bir web yanlış bilgisi), birkaç yüz "Kanberra" diyen ince ayar örneği yetmeyebilir.

Yararlı bir zihinsel model: ince ayar **çıktılar üzerindeki olasılık dağılımını** ayarlar, bazı davranışları güçlendirir ve bazılarını bastırır. Yumuşak bir yeniden ağırlıklandırmadır, yeniden yazma değil.

## LIMA: Daha Azı Daha Fazladır

2023'te Microsoft ve Pekin Üniversitesi'nden çığır açıcı bir makale olan **LIMA**, Llama 65B'yi sadece **1.000 özenle derlenmiş örnek** üzerinde ince ayar yaparak insan değerlendiricilerin zamanın %43'ünde GPT-3.5'a (DaVinci003) tercih ettiği bir model üretti. Bin örnek. Tüm hizalama veri kümesi tek bir elektronik tabloya sığdı.

LIMA, SFT için **birkaç harika örneğin milyonlarca vasat olanı geçtiğini** kanıtladı. Pratik çıkarım: veri kümesi boyutuna takılmak yerine veri kümesi *kalitesine* takılmak gerekir.

## Bugünkü Ekosistem

İnce ayar bir sektör haline geldi. Hugging Face **800.000'den fazla model kontrol noktası** barındırıyor. OpenAI, JSONL dosyası yükleyip yaklaşık **milyon eğitim token'ı başına 3 dolar** karşılığında özelleştirilmiş GPT-4o-mini alan bir ince ayar API'si sunuyor. Açık kaynak topluluğu **Axolotl**, **LLaMA-Factory** ve Hugging Face'in **TRL** kütüphanesi gibi hazır ince ayar hatları sağlıyor. Tek bir RTX 4090'da (24GB VRAM) Llama 3 8B modeli yaklaşık 2 saatte LoRA ince ayar yapabilirsiniz.

Bu erişilebilirlik uzmanlaşmış model patlaması yarattı. **Nous-Hermes**, **OpenHermes**, **WizardLM**, **Orca** — bazen çok daha büyük tescilli sistemlerle yarışan açık temel modellerin ince ayarları.

---

*Yarın, denetimli ince ayardan oyunu daha da dramatik biçimde değiştiren bölgeye geçiyoruz. SFT bir modele iyi yanıtın neye benzediğini öğretiyorsa, **RLHF — İnsan Geri Bildiriminden Pekiştirmeli Öğrenme** — ona iyi yanıtları kötü olanlara tercih etmeyi öğretir. GPT-3.5'ı ChatGPT'ye dönüştüren teknik, Claude'un kişiliğinin arkasındaki gizli sos ve modern yapay zekânın en tartışmalı eğitim yöntemlerinden biri.*

---

<div style="text-align: center; margin: 2em 0;">
<h2>📝 Gün 10 Quiz</h2>

<a href="quizzes/day-10.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 10 Quizini Çöz →</a>

</div>
