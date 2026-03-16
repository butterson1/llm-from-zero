# Day 2: Word Embeddings — The Geometry of Meaning

*How a simple trick — turning words into lists of numbers — revealed that language has a hidden geometric structure, and why "king minus man plus woman equals queen" changed everything.*

---

## The Problem That Almost Killed NLP

Yesterday we left off with a cliffhanger: n-gram models couldn't generalize. If they'd seen "the cat sat on the mat" a thousand times but never "the tabby rested on the rug," they treated that second sentence as essentially novel. The model didn't *know* that "tabby" is a kind of cat, or that "rested" is similar to "sat." Each word was an opaque symbol, as unrelated to every other word as a serial number is to the person it's assigned to.

In machine learning terms, words were represented as **one-hot vectors**: if your vocabulary has 50,000 words, the word "cat" might be a vector of 50,000 zeros with a single 1 in position 7,291. "Dog" would be all zeros with a 1 in position 12,408. Mathematically, the distance between "cat" and "dog" is exactly the same as the distance between "cat" and "thermonuclear." Every word is equally far from every other word. That's not just unhelpful — it's aggressively wrong.

This representation also suffers from a practical curse: it's enormous and sparse. A vocabulary of 100,000 words means every word is a 100,000-dimensional vector that's 99.999% zeros. Try training a neural network on that. The parameters explode, the gradients vanish, and most of the model's capacity gets wasted on dimensions that are almost always inactive.

The insight that changed everything was deceptively simple: **what if we represented each word as a short, dense vector — say, 300 numbers — where similar words have similar vectors?** Instead of a 100,000-dimensional wasteland of zeros, each word becomes a compact point in a 300-dimensional space. And crucially, the positions in that space would be *learned from data*, not assigned by hand.

This is the core idea behind **word embeddings**, and it is, without exaggeration, the single most important representational innovation in the history of natural language processing.

## The Distributional Hypothesis: You Are the Company You Keep

The theoretical backbone of word embeddings is the **distributional hypothesis**, most pithily stated by the British linguist J.R. Firth in 1957: *"You shall know a word by the company it keeps."*

The idea is that words appearing in similar contexts tend to have similar meanings. "Dog" and "cat" appear near words like "pet," "feed," "veterinarian," and "cute." "Plutonium" and "uranium" appear near "reactor," "enrichment," and "isotope." You don't need a dictionary to figure out that "dog" and "cat" are related — just look at the words surrounding them across millions of sentences.

This isn't just linguistic folklore. It's empirically testable and startlingly robust. In the 1990s, researchers at Bell Labs and elsewhere showed that purely distributional methods could cluster words into meaningful groups — nouns with nouns, verbs with verbs, countries with countries — without any labeled data at all. The statistical structure of language encodes enormous amounts of semantic information, hiding in plain sight.

But turning this insight into a practical, trainable system? That took a few more decades and a critical contribution from a team at Google.

## Word2Vec: The Paper That Launched a Thousand Startups

In 2013, Tomáš Mikolov and colleagues at Google published a pair of papers that sent shockwaves through the NLP community. The system was called **Word2Vec**, and its genius was not in the idea — Bengio had already shown neural language models could learn word representations in 2003 — but in the *engineering*. Word2Vec made it possible to train word embeddings on *billions* of words in *hours* on a single machine.

Word2Vec comes in two flavors:

### Continuous Bag of Words (CBOW)

Given a window of context words (say, 5 words on each side), predict the center word. If the context is "the ___ sat on the mat," the model must predict "cat." It's like a fill-in-the-blank game played billions of times.

### Skip-gram

The reverse: given the center word, predict the context words. Given "cat," predict that "the," "sat," "on," "mat" are likely to appear nearby. This sounds harder, and it is — but skip-gram turns out to produce better embeddings for rare words, because each training example generates multiple predictions.

Both architectures are stunningly simple. The "neural network" is barely a neural network at all — it's a single hidden layer sandwiched between the input and output. No activation functions, no deep stacking, no convolutions. Just a lookup table (the embedding matrix) and a linear projection. The entire model has two matrices: **W** (vocabulary size × embedding dimension) and **W'** (embedding dimension × vocabulary size). For a vocabulary of 100,000 words with 300-dimensional embeddings, that's 60 million parameters. GPT-4 has an estimated 1.8 *trillion*. Word2Vec is three orders of magnitude smaller than a single transformer layer.

The real trick was **negative sampling**, a training shortcut that made the math tractable. Instead of computing a probability distribution over all 100,000 vocabulary words (which requires a ruinously expensive softmax), negative sampling reformulates the problem: for each real (word, context) pair, sample 5-15 random "negative" words and train the model to distinguish real co-occurrences from fake ones. This turns a 100,000-way classification into a handful of binary decisions, slashing training time by orders of magnitude.

Mikolov trained Word2Vec on 6 billion tokens from Google News in under a day on a single machine. The resulting embeddings became the most downloaded artifact in NLP history — and they revealed something nobody expected.

## King − Man + Woman = Queen: Arithmetic in Meaning Space

Here's the moment that made word embeddings famous. Take the 300-dimensional vector for "king." Subtract the vector for "man." Add the vector for "woman." The nearest word to the resulting vector? **"Queen."**

This wasn't programmed. Nobody told the model about gender or royalty. It emerged purely from statistics over word co-occurrences. And it worked for dozens of relationships:

- **Paris − France + Italy ≈ Rome** (capitals)
- **bigger − big + small ≈ smaller** (comparative forms)
- **walking − walked + swam ≈ swimming** (tense changes)
- **Einstein − scientist + painter ≈ Picasso** (profession transfer)

What's happening here? The embedding space has organized itself so that consistent relationships between word pairs are encoded as consistent *directions*. The "gender" direction (man → woman, king → queen, uncle → aunt) is roughly the same vector everywhere in the space. The "capital city" direction (France → Paris, Italy → Rome, Japan → Tokyo) is another consistent vector. The model has discovered, through nothing but word co-occurrence statistics, that language has a hidden **linear structure**.

This was genuinely shocking to linguists and AI researchers alike. Language is supposed to be messy, ambiguous, context-dependent. And yet here it was, laid out in tidy geometric relationships like a crystal lattice. As the Stanford NLP group's Christopher Manning put it, "The thing that was most surprising is that these representations are so linear."

### The Dirty Secret of the Analogy Task

Here's the counterintuitive part: these analogies work *less well* than most popularizations suggest. In Mikolov's original evaluation on 19,544 analogy questions, Word2Vec got about 74% correct on syntactic analogies (verb tenses, plurals) but only about 64% on semantic analogies (capitals, currencies). Later work showed that the analogy method is biased — it tends to return words that are individually close to all three input words, not words that truly satisfy the parallelogram relationship. And some "analogies" reflect troubling societal biases baked into the training data: **man : computer programmer :: woman : homemaker** was a real result from embeddings trained on Google News.

These biases aren't bugs in the algorithm — they're faithful reflections of the statistical patterns in the text. Which raises a question that still hasn't been fully resolved: if your embeddings encode that doctors are men and nurses are women (because that's the statistical distribution in your training corpus), and you use those embeddings in a hiring system, you've just automated discrimination. Tolga Bolukbasi and colleagues published a landmark 2016 paper, "Man is to Computer Programmer as Woman is to Homemaker? Debiasing Word Embeddings," that documented these biases extensively and proposed geometric debiasing methods — but the deeper problem, that language *is* biased, remains.

## GloVe: Counts Meet Gradients

Skip forward to 2014. Jeffrey Pennington, Richard Socher, and Christopher Manning at Stanford released **GloVe** (Global Vectors for Word Representation), which took a philosophically different approach to the same goal.

Word2Vec is a *predictive* model: it learns embeddings by trying to predict words from context. GloVe is a *count-based* model that starts with the global word-word co-occurrence matrix — a giant table where entry (i, j) records how often word i appears near word j across the entire corpus — and then factorizes it.

The key insight behind GloVe is that *ratios* of co-occurrence probabilities encode meaning more reliably than raw probabilities. Consider three words: "ice," "steam," and "solid." The probability that "solid" appears near "ice" is high (P ≈ 1.9 × 10⁻⁴), and the probability that "solid" appears near "steam" is low (P ≈ 2.2 × 10⁻⁵). The ratio P(solid|ice)/P(solid|steam) ≈ 8.9 — a big number, telling us "solid" is much more associated with "ice" than "steam." For the word "gas," the ratio flips: P(gas|ice)/P(gas|steam) ≈ 0.085. For a neutral word like "water," the ratio is close to 1.

GloVe trains embeddings such that the dot product of two word vectors approximates the logarithm of their co-occurrence count:

> **wᵢ · wⱼ + bᵢ + bⱼ ≈ log(Xᵢⱼ)**

This is a beautifully clean objective. The model is just a weighted least-squares regression — no neural network, no backpropagation through sequences, no negative sampling. Training GloVe on 6 billion tokens (Wikipedia + Gigaword) with 300-dimensional vectors took about 4 hours on 8 CPUs.

In practice, GloVe and Word2Vec produce embeddings of comparable quality. On word similarity benchmarks like WordSim-353 and SimLex-999, the two typically score within a few percentage points of each other. GloVe has a slight edge on analogy tasks; Word2Vec tends to be better for downstream NLP tasks. The real contribution of GloVe was theoretical: it showed that the predictive (Word2Vec) and count-based (classical distributional semantics) approaches are not fundamentally different. They're two paths up the same mountain.

## The Dimensionality Question: Why 300?

Why do word embeddings typically have 200-300 dimensions? Not 50, not 10,000?

There's a practical answer and a deep answer. The practical answer is empirical: Mikolov tested dimensions from 50 to 1,000 and found that performance on analogy tasks increased steeply up to about 300 dimensions, then plateaued. More dimensions means more parameters, longer training, and diminishing returns.

The deep answer is related to the **intrinsic dimensionality** of language. How many independent axes of variation does meaning actually have? You need dimensions for gender, animacy, size, formality, sentiment, concreteness, domain (medical vs. legal vs. casual), temporal era, and hundreds of subtler distinctions. Researchers have estimated the intrinsic dimensionality of English word meaning at somewhere between 200 and 500, depending on the method. Below that, you're compressing too hard and losing distinctions. Above it, you're fitting noise.

There's a surprisingly clean relationship here with **random matrix theory**. If you take the co-occurrence matrix and compute its eigenvalues, you see a sharp elbow around rank 200-400 — below that, the eigenvalues represent genuine semantic structure; above it, they're indistinguishable from noise. The 300 dimensions that worked best empirically are, it turns out, approximately the rank where signal meets noise in natural language.

## FastText: Beyond Whole Words

One glaring limitation of Word2Vec and GloVe: they treat every word as an atomic unit. The word "unhappiness" gets its own vector, completely disconnected from "unhappy," "happiness," or "happy." For morphologically rich languages like Turkish, Finnish, or Arabic — where a single root can generate thousands of inflected forms — this is catastrophic. Most word forms will appear too rarely to learn good embeddings, if they appear at all.

In 2017, Piotr Bojanowski and colleagues at Facebook AI Research (now Meta AI) released **FastText**, which extended the skip-gram model to work on **character n-grams**. Instead of representing "unhappiness" as one vector, FastText breaks it into character sequences: "<un", "unh", "nha", "hap", "app", "ppi", "pin", "ine", "nes", "ess", "ss>" (for n=3). The word's embedding is the sum of its character n-gram embeddings.

This is elegant for three reasons. First, morphologically related words automatically share representations: "happy," "unhappy," "happiness," and "happily" all contain the n-gram "hap." Second, FastText can generate vectors for words it has never seen — by summing up the character n-gram vectors, you get a reasonable embedding for any string, even a typo or a neologism. Third, it works spectacularly well on morphologically complex languages. On Turkish word similarity tasks, FastText outperformed Word2Vec by 15-20%.

Facebook released pretrained FastText vectors for 157 languages — still one of the most widely used multilingual NLP resources in existence.

## What Embeddings Can't Do: The Polysemy Problem

Here's the counterintuitive limitation that motivates everything we'll study for the rest of this course: **static word embeddings give each word exactly one vector**, regardless of context. The word "bank" gets a single vector that's some average of its river-bank meaning and its financial-institution meaning. "Apple" blurs the fruit and the company. "Cell" merges biology, prison, and phone.

This seems like a minor nuisance, but it's actually fundamental. A 2019 analysis by Camacho-Collados and Pilehvar found that about 7.8% of common English words are significantly polysemous — and those words tend to be the *most frequent* ones. "Set" has 430 senses in the Oxford English Dictionary. "Run" has 645 definitions. These are the words you encounter most often, and they're exactly the words that static embeddings handle worst.

Various researchers tried to fix this by learning *multiple* vectors per word (Huang et al., 2012, learned one vector per "sense"), but these approaches were clunky and never gained traction. The real solution came from a different direction entirely: **contextualized embeddings**, where the representation of a word changes based on the sentence it appears in. ELMo (2018) was the first successful version, followed by BERT and GPT — which we'll get to in the coming days.

## The Legacy: Why Embeddings Still Matter

You might think word embeddings are obsolete — quaint relics from the pre-transformer era. You'd be wrong. Every modern language model, from GPT-4 to Claude to Gemini, begins by converting tokens into dense vectors via an **embedding layer**. The first thing a transformer does, before any attention or feed-forward computation, is look up a learned vector for each input token. GPT-3's embedding layer maps 50,257 token IDs to 12,288-dimensional vectors — that's 618 million parameters just for the embeddings, roughly equal to the entire parameter count of BERT-Large.

The difference is that in a transformer, the embedding is just the starting point. Those initial vectors get transformed by dozens or hundreds of layers of attention and computation, producing **contextualized** representations that change with every sentence. But the core insight — that you can learn dense vector representations of discrete symbols, and that the geometry of the resulting space encodes meaning — is straight from Word2Vec.

In a very real sense, Mikolov's 2013 papers planted the seed that grew into the entire modern LLM ecosystem. The idea that meaning has geometry, that relationships between concepts are directions in a vector space, that you can do arithmetic with ideas — that's the foundation everything else is built on.

---

*Tomorrow, we'll explore the mechanism that made transformers possible: **attention**. How does a model decide which words in a sentence matter most for understanding each other word? The answer involves a surprisingly simple operation — queries, keys, and values — that turned out to be the most important architectural innovation of the decade. Get ready to see why "Attention Is All You Need" wasn't just a catchy paper title.*

---

## Test Your Understanding

Ready to check what you've learned? Take the Day 2 quiz:

<div id="quiz-day-02"></div>
<script src="../quiz/quiz-embed.iife.js"></script>
<link rel="stylesheet" href="../quiz/style.css">
<script>
QuizEmbed.createQuiz("quiz-day-02", "/quizzes/day-02.toml");
</script>
