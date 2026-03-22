# Gün 22: Erişim-Artırılmış Üretim (RAG) — Modellere Harici Bellek Vermek

*Pratik LLM'lerdeki en önemli atılım onlara daha fazla şey bilmeyi değil, bir şeylere bakmayı öğretmekti.*

---

## Donmuş Beyin Problemi

Ön eğitim sonrası bir modelin bilgisi ağırlıklarına kalıcı olarak işlenir (Gün 6). Bilgi kesme tarihi, halüsinasyon eğilimi ve güncellenememezlik — bu sorunların hepsinin ortak kökeni budur.

RAG bu problemi zarif biçimde çözer: modele "bilmiyorsan bak" yeteneği verir.

## Neden Devasa Bağlam Penceresi Yetmez?

128K ya da 1M token bağlam penceresi harika — ama her sorguda tüm kurumsal bilgi tabanını bağlama koymak:
- Maliyetli (token başına ödeme)
- Yavaş (uzun bağlam = yavaş çıkarım)
- Gürültülü (çok bilgi = modelin odağını kaybetmesi)

RAG, sadece *ilgili* bilgiyi alıp bağlama koyarak bu sorunları çözer.

## Kanonik RAG Hattı

1. **İndeksleme**: Belgeler parçalara bölünür (tipik 256-1024 token), her parça gömme modeli ile vektöre dönüştürülür ve vektör veritabanına depolanır
2. **Arama**: Kullanıcı sorgusu vektöre dönüştürülür, en benzer belge parçaları bulunur
3. **Bağlam oluşturma**: Bulunan parçalar + kullanıcı sorusu birleştirilir
4. **Üretim**: LLM bu zenginleştirilmiş bağlamla yanıt üretir

## Arama: Seyrek, Yoğun ve Hibrit

**Seyrek arama** (BM25): Kelime eşleştirme tabanlı, hızlı ve güvenilir. "Türkiye'nin başkenti" sorgusu "Türkiye" ve "başkent" kelimelerini içeren belgeleri bulur.

**Yoğun arama**: Sorgu ve belgeler gömme vektörleri olarak karşılaştırılır. Anlamsal benzerlik yakalar — "Ankara hakkında bilgi" ile "Türkiye'nin yönetim merkezi" eşleşebilir.

**Hibrit**: İkisini birleştirir — en iyi sonuçları genellikle hibrit arama verir.

Popüler gömme modelleri: OpenAI text-embedding-3, Cohere embed-v3, BGE, E5-mistral.

## Yeniden Sıralama: Kimsenin Fark Etmediği Gizli Sos

İlk arama genellikle 20-50 aday döndürür. **Yeniden sıralayıcı** (reranker) bu adayları sorguyla birlikte çapraz-kodlayıcıdan (cross-encoder) geçirerek daha doğru sıralama yapar. Cohere Rerank ve BGE-reranker popüler seçenekler.

Yeniden sıralama, RAG kalitesini %10-20 artırabilir — düşük maliyetle yüksek getiri.

## Üretim: Model Tahmin Etmeyi Bırakıp Okumaya Başladığında

Modele "Sadece sağlanan bağlama dayanarak yanıt ver. Bilmiyorsan bilmiyorum de" talimatı vermek halüsinasyonları dramatik biçimde azaltır. Ama tamamen ortadan kaldırmaz — model bazen bağlamdaki bilgiyi yanlış yorumlayabilir.

## Önemli Hata Modları

- **İlgisiz arama**: Yanlış parçalar getirilir → yanlış yanıt
- **Kayıp bağlam**: Doğru parça getirilir ama model onu göz ardı eder (ortada kaybolma)
- **Çelişkili kaynaklar**: Farklı parçalar çelişkili bilgi içerir
- **Parçalama hataları**: Bilgi parça sınırında bölünür ve anlam kaybolur

## Makalelerden Ürünlere

RAG, 2024-2025'te kurumsal yapay zekânın temel taşı oldu. Her büyük şirket — hukuk firmaları, bankalar, sağlık kuruluşları — dahili bilgi tabanlarını LLM'lere bağlamak için RAG kullanıyor.

Popüler RAG çerçeveleri: LangChain, LlamaIndex, Haystack. Vektör veritabanları: Pinecone, Weaviate, Qdrant, Chroma, pgvector.

---

*Yarın sohbet botundan otonom çalışana geçişi keşfedeceğiz: **Ajanlar ve Araç Kullanımı.***

---

<a href="quizzes/day-22.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Gün 22 Quizini Çöz →</a>
