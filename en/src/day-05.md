# Day 5: Tokenization — BPE, SentencePiece, and Why "Token" ≠ "Word"

*You've learned about embeddings, attention, and the Transformer architecture. But there's a dirty little secret hiding underneath all of it: the model doesn't see words. It sees tokens — and how you carve text into tokens changes everything about what a model can do, how much it costs to run, and whether it can even handle your language.*

---

## The Problem Nobody Talks About

Here's a thought experiment. You're building GPT-4. You've assembled 13 trillion tokens of training data, designed an architecture with hundreds of billions of parameters, and you're about to spend north of $100 million on compute. Before any of that happens, you face the most unglamorous decision in the entire pipeline: **how do you turn raw text into numbers?**

This is tokenization — the process of converting human-readable text into a sequence of integer IDs that a neural network can process. It sounds boring. It sounds like a solved problem, the kind of plumbing work that a junior engineer handles on day one. It is, in fact, one of the most consequential design decisions in all of large language model engineering.

The tokenizer determines how many "steps" a model needs to read a sentence, which directly controls inference cost. It determines whether the model can handle code, math, rare languages, or emoji. It creates bizarre failure modes — GPT-3.5 couldn't reliably count the letters in "strawberry" because its tokenizer split it into `[' straw', 'berry']`, making the model see two tokens instead of ten characters. And it introduces a profound inequity: the same sentence costs 2-10x more tokens in some languages than in English, meaning non-English speakers literally pay more money to use the same API.

Tokenization is where linguistics, information theory, and cold engineering economics collide. Let's understand it properly.

## Why Not Just Use Characters?

The most naive approach: split text into individual characters. English has roughly 26 lowercase letters, 26 uppercase, 10 digits, and some punctuation — maybe 100 characters total. Your vocabulary is tiny and elegant. Every word, no matter how obscure, is representable.

The problem is brutal. The word "transformer" is 11 characters, meaning the model needs 11 time steps to process it. A 2,000-word article might become 10,000+ characters. Since the computational cost of self-attention scales quadratically with sequence length (or at best linearly with modern approximations), you've just made everything 3-5x more expensive. And the model has to learn, from scratch, that `t-r-a-n-s-f-o-r-m-e-r` is a meaningful unit. Character-level models do exist — they work for some tasks — but they've never matched the performance-per-compute of subword models for language understanding.

## Why Not Just Use Words?

The opposite extreme: treat every word as a single token. Split on spaces and punctuation. Now "transformer" is one token, one time step. Efficient!

But English alone has at least 170,000 words in active use (the Oxford English Dictionary lists over 600,000 historical entries). Add scientific terminology, proper nouns, slang, typos, URLs, code, and other languages, and you need millions of vocabulary entries. Each token gets its own row in the embedding matrix and its own column in the output prediction layer. With a hidden dimension of, say, 4,096, each vocabulary entry costs 4,096 × 2 = 8,192 parameters (input embedding + output projection). A vocabulary of 1 million words would burn 8 billion parameters on embeddings alone — before a single Transformer layer.

Worse, a word-level vocabulary can't handle novel words. What does the model do when it encounters "ChatGPT" for the first time? Or a German compound noun like "Geschwindigkeitsbegrenzung" (speed limit)? Or a misspelled "transformre"? It either maps everything unknown to a single `<UNK>` token — losing all information — or it fails entirely.

You need something in between.

## Byte Pair Encoding: The Elegant Compression Trick

The answer came from an unlikely place: data compression. In 1994, Philip Gage published a short paper in *C Users Journal* describing **Byte Pair Encoding (BPE)**, a simple algorithm for compressing data by iteratively replacing the most frequent pair of bytes with a new symbol. Twenty-two years later, Rico Sennrich, Barry Haddow, and Alexandra Birch at the University of Edinburgh realized this idea could revolutionize machine translation tokenization. Their 2016 paper "Neural Machine Translation of Rare Words with Subword Units" became one of the most cited works in NLP.

Here's how BPE works for tokenization:

**Step 1: Start with characters.** Your initial vocabulary is just the 256 possible bytes (or Unicode characters, depending on the implementation). Every word is fully decomposed: `"lower"` becomes `['l', 'o', 'w', 'e', 'r']`.

**Step 2: Count pairs.** Scan the entire training corpus and count how often each adjacent pair of symbols appears. Maybe `('t', 'h')` appears 50 million times, while `('q', 'z')` appears 12 times.

**Step 3: Merge the most frequent pair.** Replace every occurrence of `('t', 'h')` with a new symbol `'th'`. Add `'th'` to the vocabulary.

**Step 4: Repeat.** Count pairs again (now including `'th'` as a unit), merge the most frequent, add to vocabulary. Keep going until you hit your target vocabulary size.

After 50,000 merges, you have a vocabulary of 50,256 tokens (256 base bytes + 50,000 merges). Common words like "the" are single tokens. Common subwords like "ing", "tion", "pre" are single tokens. Rare words like "cryogenics" get split into pieces like `['cry', 'ogen', 'ics']` — not as efficient as a single token, but far better than individual characters, and every piece carries semantic signal.

The beauty of BPE is that it automatically discovers a compression-optimal vocabulary for whatever corpus you train it on. Feed it code and it learns that `def`, `return`, `function`, `import` should be single tokens. Feed it medical text and it learns `cardio`, `pulmon`, `ectomy`. Feed it multilingual data and it discovers common subwords across languages.

## GPT-2's Breakthrough: Byte-Level BPE

The original Sennrich BPE operated on Unicode characters, which created problems with rare Unicode codepoints. OpenAI's GPT-2, released in 2019, introduced **byte-level BPE**: instead of starting from characters, you start from the 256 raw bytes. Every possible text — English, Chinese, Arabic, emoji, binary data — can be represented as a sequence of bytes. No text is ever `<UNK>`. The vocabulary starts at exactly 256, and merges build up from there.

GPT-2 used a vocabulary of 50,257 tokens. GPT-3 kept the same tokenizer. GPT-4 moved to **cl100k_base**, a newer BPE tokenizer with 100,277 tokens — roughly doubling the vocabulary. GPT-4o pushed even further to **o200k_base** with approximately 200,000 tokens.

Why keep increasing? Larger vocabularies compress text more aggressively. A sentence that takes 15 tokens with a 50K vocabulary might take only 10 tokens with a 200K vocabulary. Since you pay per token at inference time, and since attention cost scales with sequence length, larger vocabularies directly reduce operational costs. The tradeoff is that the embedding matrix grows, but for models with hundreds of billions of parameters, a few hundred million extra embedding parameters is negligible — maybe 0.1% of the total model.

## SentencePiece: Tokenization Without Language Assumptions

BPE as implemented by OpenAI (and the `tiktoken` library) relies on a **pre-tokenization** step: before BPE merges happen, the text is split into rough chunks using regex patterns that recognize word boundaries, numbers, and whitespace. This pre-tokenization is a form of inductive bias — it assumes text has word-like units separated by spaces.

**SentencePiece**, developed by Taku Kudo at Google in 2018, takes a more radical approach: it treats the input as a raw stream of characters (or bytes) with no pre-tokenization at all. Spaces are treated as just another character — in fact, SentencePiece replaces spaces with a special `▁` (Unicode U+2581) character so they become visible parts of the token. This makes tokenization **fully reversible**: you can reconstruct the exact original text from the token sequence, spaces and all.

SentencePiece implements two algorithms: BPE and **Unigram**, a probabilistic alternative that works differently. While BPE builds vocabulary bottom-up by merging, Unigram works top-down: start with a huge initial vocabulary (say, millions of substrings), then iteratively remove tokens that least decrease the overall likelihood of the training corpus, until you reach the target size. The surviving tokens are those that best compress the data according to a unigram language model.

Meta's Llama 2 used SentencePiece with a 32,000-token vocabulary. Llama 3 quadrupled it to **128,256 tokens**, a move that dramatically improved multilingual performance and coding ability. That single change — just the tokenizer — was one of the reasons Llama 3 8B outperformed Llama 2 70B on many benchmarks. More tokens in the vocabulary meant more efficient text representation, which meant the model could see more content within the same context window.

## The Hidden Cost: Multilingual Inequity

Here's the surprising, counterintuitive fact that should make you uncomfortable: **a tokenizer trained predominantly on English text creates a systematic economic disadvantage for every other language in the world.**

Consider this concrete example. The English sentence "The weather is nice today" tokenizes to 5 tokens in GPT-4's cl100k tokenizer. The equivalent sentence in Turkish, "Bugün hava çok güzel," becomes 8 tokens. In Burmese or Tibetan, the same semantic content might expand to 15-25 tokens. Research by Yennie Jun and others in 2023 showed that for some African and Southeast Asian languages, the token-to-character ratio is 5-10x worse than English.

This isn't just an aesthetic problem. It's an economic one. If you're paying $0.01 per 1,000 tokens for GPT-4o, a conversation in Burmese costs 3-5x more than the same conversation in English. The model's effective context window is also 3-5x smaller — a 128K context window holds 128K tokens, but if your language is 5x less efficiently tokenized, you effectively have a 25K token window.

The root cause is simple: BPE merges reflect corpus frequency. English text dominates training corpora (typically 40-60% of pre-training data). So English subwords get aggressively merged into large tokens early, while low-resource languages remain fragmented into smaller pieces. The GPT-4o tokenizer (o200k_base) made significant strides — reportedly cutting non-English token counts by 30-50% compared to cl100k — but the gap persists.

Google's Gemini tokenizer, trained on a more deliberately multilingual corpus, handles this better. So does Llama 3's expanded 128K vocabulary, which included dedicated token allocations for Chinese, Japanese, Korean, and other scripts. But true equity would require either per-language vocabularies (complicated to manage) or much larger shared vocabularies (expensive in parameters).

## WordPiece: Google's Variant

Before leaving the algorithm zoo, a brief note on **WordPiece**, used by BERT and its descendants. WordPiece is nearly identical to BPE with one crucial difference: instead of merging the most *frequent* pair, it merges the pair that most *increases the likelihood* of the training data under a language model. In practice, this produces very similar vocabularies to BPE but with slightly better coverage of rare words.

BERT used a WordPiece vocabulary of just 30,522 tokens. This was considered large in 2018. Today it looks quaint — GPT-4o's vocabulary is 6.5x bigger.

## The Embedding Matrix: Where Tokens Become Vectors

Once text is tokenized, each token ID indexes into the **embedding matrix** — a giant lookup table of shape `(vocabulary_size, hidden_dimension)`. For Llama 3 405B with a vocabulary of 128,256 and a hidden dimension of 16,384, this single matrix contains 128,256 × 16,384 = **2.1 billion parameters**. That's just the input side; the output projection (sometimes called the "unembedding" or LM head) is another matrix of the same shape, though many models tie these weights together to save parameters.

The embedding matrix is fascinating because it's the *only* part of the model where learning is sparse. When the model processes a batch of text, only the rows corresponding to the tokens in that batch receive gradient updates. A rare token that appears in 0.001% of training data gets roughly 0.001% as many learning updates as a common token. This is why rare tokens often have poorly learned embeddings — a known failure mode when models encounter unusual Unicode characters or extremely rare words.

## Special Tokens: The Hidden Control Language

Beyond the "real" tokens learned by BPE, every tokenizer includes **special tokens** — reserved entries that serve as control signals. These are invisible to end users but critical to model behavior:

- **`<|endoftext|>`** (GPT) / **`</s>`** (Llama) — marks the boundary between documents during training. The model learns that this is where one document ends and another begins, preventing it from treating all of training data as one infinite text.
- **`<|im_start|>`** and **`<|im_end|>`** — used in ChatGPT-style models to delimit system prompts, user messages, and assistant responses.
- **`<|fim_prefix|>`**, **`<|fim_middle|>`**, **`<|fim_suffix|>`** — used for fill-in-the-middle training, where the model learns to complete code given what comes before and after a cursor position.

These tokens are never produced by the BPE merge algorithm. They're manually added to the vocabulary and imbued with meaning during training. They're the private language between the training pipeline and the model.

## Practical Consequences You Can Feel

Understanding tokenization explains several otherwise mystifying LLM behaviors:

**Arithmetic struggles.** The number "42173" might tokenize as `['421', '73']` — two tokens that the model treats as abstract symbols, not as a number with digits. The model has to learn, implicitly and unreliably, that `'421'` followed by `'73'` represents a number, and that adding 1 to it should produce `'421', '74'`. Now imagine multi-digit multiplication. Character-level tokenization of digits would actually be easier for math, and some research groups have experimented with this.

**The "strawberry" problem.** Ask GPT-4 "how many r's in strawberry?" and earlier versions would say 2 (the correct answer is 3). The tokenizer splits "strawberry" into `['straw', 'berry']`. The model never sees the individual letters — it has to somehow reason about the character composition of opaque tokens. This is like asking you how many times the letter 'e' appears in a word while showing you only the word's syllables.

**Context window economics.** When Anthropic charges for Claude API usage, you pay per input and output token. A 100-page legal document might be 150,000 tokens. The same document translated into Japanese might be 250,000 tokens. Same information, same model, wildly different costs.

**Code is expensive.** Code with lots of whitespace and rare identifiers tokenizes inefficiently. Python with 4-space indentation wastes tokens on spaces (though modern tokenizers have learned to merge common indentation patterns). Variable names like `calculateTotalRevenue` might become 3-4 tokens, while `x` is always 1.

## The Frontier: What's Changing

The field isn't standing still. Several innovations are pushing tokenization forward:

**Byte-level models.** Meta's MegaByte (2023) and subsequent work explored models that operate directly on raw bytes, eliminating the tokenizer entirely. The idea: let the model learn its own segmentation. Results are promising but not yet competitive with BPE for large-scale language modeling — the sequence length explosion is hard to overcome.

**Dynamic vocabularies.** Rather than freezing the vocabulary before training, some researchers are exploring tokenizers that adapt during training, adding new merges as the model encounters new domains.

**Tokenizer-free approaches.** Google's Charformer (2022) learned soft subword boundaries within the model itself, using a differentiable tokenization module. This removes the hard, discrete segmentation decisions that BPE imposes.

But for now, BPE remains king. It's simple, fast, well-understood, and scales. Every frontier model in 2026 — GPT-4o, Claude 3.5, Gemini 2.0, Llama 3.1 — uses some variant of byte-pair encoding. The algorithm from that 1994 data compression paper has proven remarkably durable.

---

## Key Takeaways

1. **Tokenization converts text to integers** — the bridge between human language and neural computation
2. **BPE iteratively merges frequent pairs** — finding a compression-optimal vocabulary between characters and words
3. **Vocabulary size matters enormously** — from GPT-2's 50K to GPT-4o's 200K, bigger vocabularies mean cheaper inference and better multilingual performance
4. **SentencePiece removes pre-tokenization** — treating text as a raw byte stream for language-agnostic processing
5. **Tokenization creates inequity** — non-English languages pay more in cost and context window per unit of meaning
6. **The tokenizer shapes model behavior** — arithmetic, letter counting, and code efficiency are all downstream of tokenization choices

---

*Tomorrow in Day 6, we'll zoom out from the mechanics of individual models to the big picture of training: how do you actually teach a model language from scratch? We'll explore pre-training — the process where models consume trillions of tokens from the internet to develop their understanding, and the critical difference between masked language modeling (used by BERT) and causal language modeling (used by GPT). The tokenizer you just learned about determines what the model sees; pre-training determines what it learns.*

---

<div style="margin-top: 2em; padding: 1.5em; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Time

Test your understanding of today's material:

<a href="quizzes/day-05.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Take the Day 5 Quiz →</a>

</div>
