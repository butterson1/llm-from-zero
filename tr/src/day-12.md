# Gün 12: Anayasal YZ ve Güvenlik — İnsan Etiketi Olmadan Hizalama

*Anthropic, RLHF'nin opak ahlaki ortalamasını yazılı bir yasal koda daha yakın bir şeyle değiştirmeye nasıl çalıştı — ve bu fikrin neden tek bir şirketin sohbet botunun çok ötesinde önemi olabilir.*

---

## RLHF'nin Gizli Anayasasıyla İlgili Problem

Gün 11'de RLHF'nin nasıl çalıştığını gördünüz: insanlar çıktıları karşılaştırır, ödül modeli tercihlerini öğrenir, pekiştirmeli öğrenme modeli optimize eder. Ama burada gizli bir problem var. RLHF'deki insan etiketçiler kararlarını neye dayanarak verir? İç sezgilerine. Eğitim materyallerine. Kültürel önyargılarına. Bu kararların toplamı bir *gizli anayasa* oluşturur — hiçbir yerde yazılı olmayan, denetlenemeyen, değiştirilmesi zor bir değerler sistemi.

Anthropic'in kurucuları — çoğu OpenAI'dan ayrılan — bu problemin farkına erken vardı. Çözümleri zarif biçimde basitti: kuralları yazıya dökün.

## Kuralları Yazmak

Anayasal YZ, Anthropic'in Aralık 2022'de yayınladığı makalede tanıtıldı. Temel fikir: modele sadece "iyi ol" demek yerine, açık ilkeler listesi verin ve modeli *kendi çıktılarını* bu ilkelere göre eleştirmesini öğretin.

Anthropic'in anayasası şöyle ilkeler içeriyordu:
- "Bu yanıtın zararlı, etik dışı, ırkçı, cinsiyetçi, toksik, tehlikeli ya da yasadışı içerik içerip içermediğini düşünün"
- "Yanıtın doğru, yardımcı ve zararsız olmasını sağlayacak bir revizyon seçin"
- "İnsanların haklarına saygı gösterip göstermediğini değerlendirin"

Bu ilkeler BM İnsan Hakları Evrensel Beyannamesi, Apple'ın kullanım şartları ve Anthropic'in kendi araştırma ilkelerinden türetilmişti.

## Aşama Bir: Model Kendini Eleştirmeyi Öğreniyor

İlk aşamada model zararlı olabilecek bir istem alır, bir yanıt üretir, sonra *kendi yanıtını* anayasal ilkelere göre eleştirir. "Bu yanıt zararlı mı? Daha az zararlı nasıl revize edilebilir?" Bu öz-eleştiri süreci birden fazla tur sürer — model kendi çıktısını yinelemeli olarak iyileştirir.

Sonuç, zararsız ve zararlı yanıt çiftleri kümesidir — ama insan etiketçiler tarafından değil, modelin kendi öz-eleştirisi tarafından üretilmiş. Bu, ölçeklemeyi dramatik biçimde kolaylaştırır çünkü insan emeğini darboğaz olmaktan çıkarır.

## Aşama İki: RLAIF — YZ Geri Bildiriminden Pekiştirmeli Öğrenme

İkinci aşama RLHF'nin yapısını takip eder ama kritik bir farkla: insan karşılaştırmaları yerine **YZ karşılaştırmaları** kullanır. Model, hangi yanıtın anayasal ilkelere daha uygun olduğunu değerlendirir ve bu YZ geri bildirimi ödül modeli eğitmek için kullanılır.

Bu bir paradigma kaymasıdır. İnsan geri bildiriminden YZ geri bildirimine geçiş çeşitli avantajlar sunar:
- **Ölçeklenir**: Sınırsız karşılaştırma verisi üretebilirsiniz
- **Tutarlıdır**: YZ yorulmaz, kötü gün geçirmez, önyargı günleri yaşamaz
- **Açıklanabilir**: Her karar yazılı bir ilkeye dayandırılabilir
- **Denetlenebilir**: İlkeleri değiştirebilir ve etkiyi ölçebilirsiniz

## Bu Neden Bazen İnsan Etiketlemeden Daha İyi Çalışır

Sezgiye aykırı olarak Anthropic, bazı güvenlik ölçütlerinde RLAIF'in RLHF'yi geçtiğini buldu. Neden? Çünkü insan etiketçiler tutarsız. Yorulurlar, dikkat dağılır, farklı kültürel standartlara sahiptirler. Açıkça yazılmış bir anayasa bu varyasyonu azaltır.

Ama bu, YZ'nin insan yargısından daha iyi olduğu anlamına gelmez. Sadece *tutarlı* bir sinyalin *gürültülü* bir sinyalden daha iyi olabildiği anlamına gelir — o tutarlı sinyal kabul edilebilir kalite eşiğinin üzerindeyse.

## Kırmızı Takım: İhtiyacınız Olan Düşman

Anayasal YZ hizalama hikâyesinin sadece bir parçası. Güvenliğin diğer kritik bileşeni **kırmızı takım** — modeli kasıtlı olarak kırmaya çalışan insanlar (ve giderek artan biçimde diğer yapay zekâlar) tutmak.

Anthropic hem insan kırmızı takımları hem de otomatik kırmızı takım kullanır. Otomatik kırmızı takımda bir model diğerini kandırmaya çalışır — zararlı çıktıları tetikleyecek istemler üretir. Bu süreç binlerce saldırı vektörünü keşfeder ve her birini kapatmak sistemi daha sağlam yapar.

> 💡 **Goodhart Yasası neden tehlikeli?** "Bir ölçüt hedef haline geldiğinde iyi bir ölçüt olmaktan çıkar." Ödül modeli "zararsızlık" için optimize edildiğinde, model gerçekten zararsız olmak yerine zararsız *görünmeyi* öğrenebilir — sorulardan kaçınarak, aşırı belirsiz yanıtlar vererek ya da yararlılığı feda ederek.

## Kimin Anayasası?

Anayasal YZ'nin derin bir felsefi sorunu var: bu değerler nereden geliyor? Anthropic bir şirket — ABD'de kurulu, çoğunlukla ABD vatandaşlarından oluşan bir ekiple. Anayasaları evrensel insan hakları ilkeleri içerse de, bunların yorumu ve uygulaması kaçınılmaz olarak belirli kültürel bir perspektifi yansıtır.

Bu, tüm hizalama yaklaşımları için geçerli bir eleştiri. RLHF etiketçilerinin değerleri gizli kalır; Anayasal YZ'nin değerleri en azından yazılıdır. Bu onları tarafsız kılmaz. Ama insanlara değerli bir şey verir: bir tutamak. Denetlenecek, tartışılacak, revize edilecek ve karşılaştırılacak bir şey.

Uzun vadede bu, yapay zekâ güvenliğinin diğer olgun kurumlara benzemeye başlaması olabilir. Uçakların kontrol listeleri var. Demokrasilerin anayasaları var. Finansal sistemlerin muhasebe standartları var. Yüksek riskli sistemler mükemmel oldukları için değil, çalışma ilkeleri denetlenip sorgulanabilecek kadar açık olduğu için güvenilir hale gelir.

Büyük dil modelleri o olgunluk düzeyine yakın değil. Ama Anayasal YZ o yöne işaret ediyor.

---

*Yarın yazılı anayasalardan farklı bir yönlendirme sinyaline geçiyoruz: istemin kendisi. Çünkü sonraki gizem neredeyse öz-eleştiri kadar tuhaf — bir bağlam penceresindeki birkaç örneğin modelin davranışını neden dramatik biçimde değiştirebildiği. **Gün 13, prompt mühendisliği ve bağlam içi öğrenme hakkında.***

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Zamanı

<a href="quizzes/day-12.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 12 Quizini Çöz →</a>

</div>
