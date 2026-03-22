# Gün 13: Prompt Mühendisliği ve Bağlam İçi Öğrenme — Neden Örnekler İşe Yarar

*Kimsenin tasarlamadığı, kimsenin tam olarak anlamadığı ve kimsenin öngöremediği bir numara nasıl modern yapay zekânın en önemli pratik becerisi haline geldi — ve bir transformer'ın içinde gerçekte ne olduğu hakkında ne ortaya koyuyor.*

---

## Spektrum: Sıfır-Örnekli, Az-Örnekli, Çok-Örnekli

GPT-3 piyasaya çıktığında en şaşırtıcı keşif kod ya da şiir yazabilmesi değildi — birkaç örnek gösterildiğinde tamamen yeni görevleri *ağırlıkları değişmeden* yapabilmesiydi. Bu **bağlam içi öğrenme** (in-context learning, ICL).

**Sıfır-örnekli (zero-shot):** Modele sadece talimat verin. "Bu cümlenin duygusunu sınıfla: 'Yemek harikaydı!'" → "Olumlu"

**Az-örnekli (few-shot):** Birkaç gösteri örneği verin. "Yemek harikaydı! → Olumlu. Servis korkunçtu. → Olumsuz. Fiyatlar makuldü. → ?" Model kalıbı tanır ve "Tarafsız" üretir.

**Çok-örnekli (many-shot):** Uzun bağlam pencerelerinin gelişiyle yüzlerce, binlerce örnek sığdırılabilir. Google'ın Gemini 1.5 Pro çalışması, bağlam penceresindeki örnek sayısını artırmanın ince ayar performansına yaklaştığını gösterdi.

## İçeride Gerçekte Ne Oluyor?

Bağlam içi öğrenme neden çalışıyor? Bu, alanın en tartışmalı sorularından biri. Birkaç teori var:

**Bayes çıkarımı hipotezi:** Model ön eğitim sırasında birçok görevi gördü. Örnekler verildiğinde model doğru "görevi" tanır ve uygun davranışı çağırır. Görev öğrenmez — görev *tanır*.

**Örtük gradyan inişi hipotezi:** Bazı araştırmacılar (Akyürek ve ark., 2022; Von Oswald ve ark., 2023) transformer dikkat katmanlarının ileri geçiş sırasında gradyan inişinin bir biçimini *örtük olarak* gerçekleştirdiğini gösterdi. Örnekler "eğitim verisi" gibi işlev görür ve dikkat mekanizması "ağırlık güncellemesi" gibi davranır — ama modelin gerçek ağırlıkları değişmez.

**Sıkıştırma hipotezi:** Model ön eğitim sırasında dilin istatistiksel yapısını o kadar derinlemesine öğrendi ki örneklerden genelleme yapabilme zaten parametrelerine kodlanmış.

## Prompt Mühendisliğinin Yükselişi

Prompt mühendisliği — modele ne söylediğinizi optimize etme sanatı — milyar dolarlık bir beceri haline geldi. Temel teknikler:

**Düşünce zinciri (Chain-of-Thought, CoT):** "Adım adım düşünelim" demek modelin ara muhakeme adımları üretmesini sağlar ve doğruluğu dramatik biçimde artırır. Wei ve ark.'nın (2022) gösterdiği gibi, GSM8K matematik ölçütünde standart istemle %18 olan doğruluk CoT ile %57'ye çıktı.

**Rol atama:** "Sen deneyimli bir avukatsın" gibi roller vermek modelin yanıt dağılımını o alanın metinlerine doğru kaydırır.

**Yapılandırılmış çıktı:** "JSON formatında yanıt ver" ya da belirli bir şema talep etmek çıktının tutarlılığını artırır.

**Sıfır-örnekli CoT:** "Adım adım düşünelim" kelimelerini eklemek — Kojima ve ark.'nın (2022) gösterdiği beş kelimelik devrim — ek örnek gerekmeden muhakemeyi iyileştirir.

> 💡 **Prompt mühendisliği neden "mühendislik" değil "programlama"?** Çünkü istem ile model davranışı arasındaki ilişki tam olarak anlaşılmıyor. Aynı istem farklı modellerde farklı sonuçlar verebilir. Bu, bilimden çok zanaate, programlamadan çok deneysel biyolojiye benzer.

## Şaşırtıcı Kırılganlık

İşte rahatsız edici gerçek: istemler inanılmaz derecede kırılgandır. Küçük değişiklikler büyük etkilere sahip olabilir:

- Örneklerin sırası sonuçları %20'ye kadar değiştirebilir
- "Bu cümlenin duygusu nedir?" vs "Bu cümle olumlu mu olumsuz mu?" farklı doğruluklar verir
- Gereksiz bilgi eklemek ("Bir profesör olarak düşünün") bazen iyileştirir, bazen kötüleştirir
- Sondaki boşluk ya da noktalama bile fark yaratabilir

## Sistem Mesajları ve Talimat Hiyerarşisi

Modern sohbet modelleri üç katmanlı bir talimat hiyerarşisi kullanır:
1. **Sistem mesajı:** En yüksek öncelik — modelin kişiliğini ve kurallarını belirler
2. **Kullanıcı mesajları:** Gerçek sorgular
3. **Asistan yanıtları:** Önceki dönüş geçmişi

Bu hiyerarşi "jailbreak" saldırılarına karşı savunma sağlar — kullanıcı "önceki tüm talimatları unut" dese bile sistem mesajı baskın kalmalı. Pratikte bu savunma kusursuz değil; "istem enjeksiyonu" araştırması aktif bir güvenlik alanı.

## Çok-Örnekli Bağlam İçi Öğrenme: Uzun Bağlam Devrimi

Bağlam pencereleri büyüdükçe (512'den 1M+ token'a, Gün 18) bağlam içi öğrenme dramatik biçimde güçlendi. Gemini 1.5 Pro'nun 1M token penceresiyle yüzlerce örnek sığdırabilirsiniz — ince ayar yapmadan.

Agarwal ve ark.'nın (2024) "Many-Shot In-Context Learning" çalışması gösterdi ki yüzlerce örnekle bağlam içi öğrenme bazı görevlerde ince ayarlı modellere yaklaşıyor. Bu derin bir çıkarımı var: uzun bağlam pencereleri "çıkarım zamanı ince ayarı" gibi davranır.

## Pratik Çıkarımlar

**Önemli talimatları istemin başına ve sonuna koyun.** Modelin dikkati ölçülebilir birincillik ve yenilik önyargılarına sahip — uzun bağlamların ortasındaki bilgi daha az dikkat çeker ("ortada kaybolma" olgusu).

**Muhakeme görevleri için düşünce zinciri kullanın.** Bu bir hile değil; modele çalışacağı daha fazla hesaplama adımı vermek. Otoregresif modeller çıktı token'ı başına O(1) hesaplama yapabilir; düşünce zinciri etkin biçimde hesaplama derinliği için çıktı token'ları takaslamanızı sağlar.

**Deneysel olarak yineleyin.** İstem metni ile model davranışı arasındaki ilişki tam anlaşılmadığından prompt mühendisliği kısmen ampirik bir disiplin olmaya devam eder.

---

*Yarın gerçekten tuhaf bölgeye adım atıyoruz: **ortaya çıkan yetenekler**. Düşünce zinciri istemlemesi kendisi ortaya çıkışın en ünlü örneklerinden biri — belirli bir model ölçeğinin üzerinde görünüşte hiçbir yerden aniden beliren bir yetenek.*

---

## 📝 Quiz Zamanı

<a href="quizzes/day-13.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 13 Quizini Çöz →</a>
