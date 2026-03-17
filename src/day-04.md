# Day 4: The Transformer Architecture — Encoder, Decoder, and Why It Changed Everything

*You've seen the attention mechanism — the engine. Today you see the car it goes into: a machine so elegantly designed that nine years later, trillion-parameter models still use essentially the same blueprint.*

---

## A Paper That Almost Wasn't

In the spring of 2017, eight researchers at Google had a problem. They'd built something extraordinary — a sequence-to-sequence model with no recurrence, no convolutions, nothing but attention and simple feed-forward layers — and it worked shockingly well. But when they submitted "Attention Is All You Need" for review, the reception was mixed. Some reviewers thought it was incremental. Others found the title arrogant.

The paper got in. Then it detonated.

By 2026, the Transformer architecture has become the most consequential engineering blueprint in computing history. It powers GPT-4, Claude, Gemini, Llama, Mistral, DeepSeek-V3 — every frontier language model. It has spread to computer vision (ViT), protein structure prediction (AlphaFold 2), music generation (Jukebox), weather forecasting (Pangu-Weather), and robotics. The original paper has accumulated over 140,000 citations. A single architecture design, proposed for machine translation, became the universal substrate of AI.

But the Transformer isn't just attention. Attention is the headline act, but the architecture succeeds because of an entire ensemble of carefully chosen components — residual connections, layer normalization, position-wise feed-forward networks, and a specific encoder-decoder arrangement — each solving a distinct problem. Strip any one away and the whole thing collapses. Today, we're going to understand every piece and why it's there.

## The Big Picture: Two Towers

The original Transformer follows the encoder-decoder pattern that was standard for machine translation. You have a source sentence (say, English) and you want to produce a target sentence (French). Two separate networks handle the two jobs:

**The Encoder** reads the entire source sentence and builds a rich, contextualized representation of every token. It processes all positions in parallel. After 6 layers of self-attention and feed-forward processing, each token's representation encodes not just what that token is, but its role in the full context of the sentence.

**The Decoder** generates the target sentence one token at a time, attending both to its own previously generated tokens and to the encoder's output. It is autoregressive: token 5 depends on tokens 1-4, and so on.

This split matters. The encoder can see the whole input simultaneously — perfect for understanding. The decoder must generate sequentially — necessary for producing coherent output. These are fundamentally different computational regimes, and the Transformer handles both with the same basic building block: the **Transformer block**.

## Inside a Transformer Block

Both the encoder and decoder are built from stacked blocks (6 each in the original paper). Each block has the same basic pattern: attention, then feed-forward, with residual connections and normalization wrapping each sub-layer.

Let's trace a token through a single encoder block:

### Step 1: Multi-Head Self-Attention

The token's representation — a vector of 512 numbers in the base model — enters the self-attention layer. Here, it gets projected into queries, keys, and values across 8 parallel attention heads (each operating in 64 dimensions), computes attention weights against all other tokens, and produces a new representation that's enriched with information from the rest of the sequence.

You already know this from Day 3. But what happens next is equally important.

### Step 2: Add & Normalize (The Residual Connection)

The output of self-attention doesn't simply replace the original input. Instead, the model **adds** the self-attention output to the original input:

**output = LayerNorm(x + SelfAttention(x))**

This is a **residual connection** (also called a skip connection), borrowed from ResNet, the 2015 computer vision architecture that allowed training of networks 152 layers deep. The idea is beautifully simple: instead of learning the full transformation from input to output, each sub-layer only needs to learn the *difference* — the residual. If the optimal behavior at some layer is to do nothing, the network can simply learn to output zeros, and the input passes through unchanged.

Why is this critical? Without residual connections, deep Transformers are nearly impossible to train. Gradients must flow backward through every layer during backpropagation. In a deep network, this creates the **vanishing gradient problem**: gradients get multiplied by weight matrices at each layer, and if those multiplications consistently shrink the signal, by the time gradients reach the early layers, they're effectively zero. The network's first layers stop learning.

Residual connections create a **gradient highway** — a direct path from the output back to the input that bypasses all the intermediate processing. Even if the attention and feed-forward layers have gradient-unfriendly behavior, the skip connection guarantees that at least *some* gradient flows straight through. This is why you can stack 96 Transformer layers (as in GPT-3) or even more without the training process falling apart.

### Step 3: The Feed-Forward Network

After self-attention and normalization, each token passes through a **position-wise feed-forward network** (FFN). This is deceptively simple: two linear transformations with a nonlinear activation in between.

**FFN(x) = W₂ · ReLU(W₁ · x + b₁) + b₂**

In the base Transformer, the input dimension is 512, the inner dimension expands to 2,048 (4× expansion), and then projects back down to 512. The same weights are applied independently to each token position — hence "position-wise." There's no interaction between tokens here. That's attention's job.

So what is the FFN actually doing?

This is one of the most underappreciated insights about Transformers: **attention and feed-forward layers play fundamentally different roles.** Attention is about *communication* — letting tokens share information. The FFN is about *computation* — processing each token's representation individually after it's gathered context from its neighbors.

Research by Mor Geva et al. (2021) at Tel Aviv University revealed something fascinating: the FFN layers act as **key-value memories**. The first linear layer (W₁) acts like a pattern matcher — its rows activate for specific input patterns (a particular concept, syntactic structure, or semantic role). The second layer (W₂) stores the associated output — the information to inject when that pattern is detected. In other words, each FFN is a soft lookup table with roughly 2,048 entries, each encoding a learned fact or transformation rule.

This means the feed-forward layers are where factual knowledge lives. When GPT-4 "knows" that Paris is the capital of France, that knowledge is stored as patterns in the FFN weights, not in the attention layers. Attention figures out what's relevant; the FFN retrieves and applies knowledge.

### Step 4: Another Add & Normalize

Same as step 2 — the FFN output is added to its input (residual connection) and layer-normalized. The resulting vector becomes the input to the next block.

That's it. That's one encoder block: **self-attention → add & norm → FFN → add & norm.** Stack six of these, and you have the full encoder.

## Layer Normalization: The Unsung Hero

Layer normalization appears after every sub-layer, and most people gloss over it. That's a mistake — without it, Transformers don't train.

LayerNorm normalizes each token's representation to have zero mean and unit variance across its dimensions, then applies learned scale and shift parameters:

**LayerNorm(x) = γ · (x - μ) / σ + β**

where μ and σ are the mean and standard deviation across the 512 dimensions of a single token's vector, and γ and β are learned per-dimension parameters.

Why is this necessary? During training, the statistical distribution of activations tends to shift from layer to layer and batch to batch — a phenomenon called **internal covariate shift**. Each layer has to constantly adapt to a moving target. LayerNorm stabilizes these distributions, keeping each layer's input in a well-behaved range and allowing learning rates to be much higher than would otherwise be safe.

Here's a subtlety that spawned years of debate: the original Transformer applies LayerNorm *after* the residual addition ("Post-LN"), as I wrote above: **LayerNorm(x + SubLayer(x))**. But in 2020, Xiong et al. showed that applying it *before* the sub-layer ("Pre-LN"): **x + SubLayer(LayerNorm(x))** — makes training significantly more stable, especially for deep models. Most modern Transformers, including GPT-3 and its descendants, use Pre-LN. It's one of those small modifications that took three years to discover but is now standard everywhere.

The difference matters more than it sounds. With Post-LN, the gradient through the residual path also passes through the normalization, which can distort it. With Pre-LN, the residual connection is completely unimpeded — gradients flow through the skip connection with zero interference. For a 96-layer model, that difference is the gap between training that converges and training that diverges.

## The Decoder: Autoregression and Masking

The decoder block is slightly more complex than the encoder, with one crucial addition: a **cross-attention** layer.

Each decoder block has three sub-layers:

1. **Masked self-attention:** The decoder attends to its own previous outputs, but with a critical constraint — each position can only attend to positions *before* it (and itself). This is enforced by a **causal mask**: a triangular matrix that sets attention scores to -∞ for all future positions, ensuring they become zero after softmax. Without this mask, the decoder could "cheat" by looking at future tokens during training, making the next-token prediction task trivially easy and destroying the model's ability to generate text at inference time.

2. **Cross-attention:** This is where the decoder looks at the encoder. The decoder's representation at each position generates queries, but the keys and values come from the encoder's output. This is how the decoder accesses the source sentence — it's Bahdanau attention from Day 3, but implemented with the queries-keys-values formalism.

3. **Feed-forward network:** Identical to the encoder's FFN.

Each sub-layer has its own residual connection and layer normalization.

The causal mask is one of the most elegant design choices in the architecture. During training, the model processes the entire target sentence in parallel — all positions simultaneously. But the mask ensures that position *t* can only see positions 1 through *t*, simulating the sequential generation process. This is called **teacher forcing**: the model sees the correct previous tokens (from the training data) rather than its own predictions. It's like letting a student take a test where each question reveals the answer to the previous one — but only the previous one.

This parallelism is why Transformer training is so fast. A recurrent decoder would need to process each token sequentially, even during training. The masked Transformer decoder processes all tokens at once, using the mask to maintain the autoregressive property. On a 512-token sequence, that's a 512× speedup.

## Where the Parameters Live

Let's do the accounting for the base Transformer (d_model = 512, d_ff = 2048, 8 heads, 6 layers per stack).

For **one encoder block**:
- Self-attention: 4 projection matrices (Q, K, V, and output), each 512×512 = 262,144 parameters × 4 = **~1.05M**
- FFN: W₁ is 512×2048, W₂ is 2048×512, plus biases = **~2.1M**
- LayerNorm: 2 × 512 × 2 (scale and shift for each of two sub-layers) = **~2K**
- Total per encoder block: **~3.15M**

Six encoder blocks: **~19M**

For **one decoder block**, add cross-attention (~1.05M) = **~4.2M** per block, **~25M** for six.

Plus embeddings (vocabulary of ~37,000 × 512) and the final output projection: **~19M**.

Grand total: roughly **65 million parameters**. By modern standards, this is minuscule — GPT-4 is rumored to have over 1.7 trillion parameters across its mixture-of-experts setup. But the original Transformer's 65M parameters were enough to set state-of-the-art results in machine translation. Every parameter was working hard.

Notice where the bulk of the parameters live: in the feed-forward layers. The FFN accounts for about two-thirds of each block's parameters (2.1M vs. 1.05M for attention). This ratio has remained surprisingly stable across the scaling era. In GPT-3's 175 billion parameters, the FFN layers still hold roughly two-thirds of the weights. This is consistent with the view that FFN layers are the model's "knowledge store" — you need a lot of capacity to memorize the world's information.

## The Decoder-Only Revolution

Here's an irony of AI history: the Transformer's most successful application doesn't use the encoder at all.

GPT-1 (2018) made a radical simplification. Alec Radford and colleagues at OpenAI took only the decoder stack, threw away the encoder and cross-attention, and trained it as a pure language model: predict the next token, given all previous tokens. No translation pairs needed. No source and target languages. Just raw text from the internet.

This decoder-only architecture is what powers GPT-2, GPT-3, GPT-4, Claude, Llama, Mistral, and most modern language models. The encoder-decoder architecture survives in models like T5, BART, and the original version of Google's translation system, but for the flagship generative AI models, decoder-only has won.

Why? Three reasons:

**Simplicity.** One stack instead of two. Fewer design decisions. Fewer hyperparameters to tune.

**Unified pre-training objective.** Causal language modeling (predict the next token) is the most natural self-supervised objective for text. You don't need parallel corpora or carefully designed tasks — just throw text at it.

**Scaling properties.** Decoder-only models have proven empirically to scale more smoothly. When DeepMind published their Chinchilla scaling laws in 2022, the experiments were all on decoder-only models. The scaling curves are remarkably clean: double the parameters, halve the loss, with extraordinary predictability.

There's also BERT's approach — **encoder-only** — which uses masked language modeling: randomly hide 15% of tokens and predict them from the surrounding context. BERT (340M parameters, 2018) was enormously influential for understanding tasks (classification, question answering, named entity recognition) but isn't used for generation. You can't use a model that sees the whole sentence to write the next word — it's already peeking at the answer.

So the three Transformer paradigms are:

| Architecture | Sees | Used For | Examples |
|---|---|---|---|
| Encoder-only | Full input (bidirectional) | Understanding, classification | BERT, RoBERTa |
| Decoder-only | Past tokens only (causal) | Generation, general-purpose | GPT, Claude, Llama |
| Encoder-decoder | Encoder: full input; Decoder: past output | Translation, summarization | T5, BART, mBART |

The decoder-only models dominate today because generation turns out to be the harder, more general problem. A model that can generate coherent text can also answer questions, classify sentiment, translate languages, and write code — all framed as "given this input, generate the right output." The encoder-decoder split was an optimization for translation that turned out to be unnecessary for the general case.

## The Surprising Simplicity

Here's the fact that should genuinely surprise you: **the Transformer contains no task-specific components.**

Read the architecture description again. Self-attention: generic pairwise similarity computation. Feed-forward network: a simple two-layer MLP. Residual connections: borrowed from image classification. Layer normalization: a generic statistical regularizer. Positional encodings: sinusoidal functions.

There is *nothing* in the Transformer that says "this is for language." No grammar rules. No parse trees. No part-of-speech tags. No morphological analysis. No linguistic knowledge of any kind. It's a general-purpose sequence processing machine — and yet it learned, from raw text alone, to handle syntax, semantics, pragmatics, reasoning, and common sense.

This is why the architecture transferred so effortlessly to vision (ViT processes image patches as a sequence), audio (Whisper treats spectrograms as sequences), protein structure (AlphaFold 2 treats amino acid chains as sequences), and even weather (Pangu-Weather treats atmospheric grid points as sequences). The Transformer doesn't know what it's processing. It just knows how to let elements of a sequence talk to each other and build increasingly refined representations.

John Carmack, the legendary game programmer, described it well: the Transformer is "embarrassingly simple." The magic isn't in the components — it's in the *combination* of components and the *scale* at which they're applied.

## Training Tricks That Made It Work

The original paper included several training details that are easy to overlook but were essential:

**Warmup learning rate schedule.** Instead of starting with a fixed learning rate, the Transformer uses a schedule that linearly increases the learning rate for the first 4,000 steps, then decreases it proportionally to the inverse square root of the step number. This warmup prevents the model from making wildly large updates in early training when the loss landscape is poorly understood. Almost every modern Transformer uses some form of warmup.

**Dropout.** The model applies dropout (rate 0.1 in the base model) to attention weights and after each sub-layer. This prevents overfitting by randomly zeroing out 10% of values during training, forcing the model to develop redundant representations.

**Label smoothing.** Instead of training the model to predict a probability of 1.0 for the correct next token and 0.0 for everything else, the paper uses label smoothing with ε = 0.1 — distributing a small amount of probability mass uniformly across all tokens. This actually hurts perplexity (the model becomes less "confident" in its predictions) but improves BLEU scores and generalization. The model learns to be appropriately uncertain rather than overconfident.

**Adam optimizer with custom β₂.** The paper uses Adam with β₁ = 0.9, β₂ = 0.98, and ε = 10⁻⁹. The unusually high β₂ (standard is 0.999) means the optimizer adapts its learning rate faster based on recent gradient magnitudes, which suits the Transformer's training dynamics.

These aren't glamorous details. But the difference between a Transformer that trains and one that doesn't often comes down to precisely these choices. The architecture is necessary, but not sufficient — you need the training recipe too.

## The Numbers in Context

Let's zoom out and appreciate what the original Transformer accomplished:

| Metric | Base Transformer | Previous SOTA | Improvement |
|---|---|---|---|
| EN-DE BLEU | 27.3 | 26.36 | +0.94 |
| EN-FR BLEU | 38.1 | 41.0 (ensemble) | Matched single model |
| EN-DE (big) | 28.4 | 26.36 | +2.04 |
| EN-FR (big) | 41.8 | 41.0 | +0.8 |
| Training cost (base) | 12 hours, 8 P100s | Weeks of training | ~10-50× cheaper |

The big model surpassed ensemble systems — combinations of multiple independently trained models — with a single model. And it did so in 3.5 days of training. The previous state-of-the-art English-to-French system had been trained for weeks.

Training cost in 2017 cloud pricing: roughly $150 for the base model, maybe $800 for the big model. Today, GPT-4's training cost is estimated at $50–100 million. The architecture is the same. The only things that changed are scale (parameters, data, compute) and some incremental refinements. That's the most remarkable fact about the Transformer: it was *already the right architecture* at birth. Nine years of progress has been about scaling it up, not reinventing it.

## Why This Architecture Endures

The Transformer's longevity is almost unprecedented in machine learning. Previous dominant architectures — perceptrons, vanilla RNNs, LSTMs, CNNs — each reigned for 3-5 years before being superseded. The Transformer has held the crown since 2017, and there's no serious challenger on the horizon in 2026.

Why? Because it hits a rare sweet spot:

1. **Mathematical elegance.** The core operations (matrix multiplications, softmax) are simple and well-understood.
2. **Hardware alignment.** It maps perfectly onto GPU/TPU architectures optimized for dense matrix operations.
3. **Scaling predictability.** Loss decreases smoothly and predictably as you add parameters and data.
4. **Modular extensibility.** You can swap components (different attention patterns, different FFN architectures, different normalization) without redesigning the whole system.
5. **Empirical robustness.** It works across domains — language, vision, audio, science — without fundamental modification.

It's the rare design that was right from the start. Most architectures in ML history needed years of iterative refinement. The Transformer needed scale.

---

*Tomorrow, we'll dive into something you encounter every time you use an AI system but probably never think about: **tokenization**. Why does GPT-4 think "tokenization" is one token but "token" is also one token? Why does it struggle with counting letters in words? Why do non-English languages cost more to process? The answers involve a fascinating algorithm called Byte Pair Encoding and the surprisingly deep consequences of how you chop text into pieces before feeding it to a Transformer.*

---

## Test Your Understanding

Ready to check what you've learned? Take the Day 4 quiz:

<div id="quiz-day-04"></div>
<script src="../quiz/quiz-embed.iife.js"></script>
<link rel="stylesheet" href="../quiz/style.css">
<script>
QuizEmbed.createQuiz("quiz-day-04", "/quizzes/day-04.toml");
</script>
