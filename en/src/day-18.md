# Day 18: Context Windows — From 512 to 1M+ Tokens

*How transformers learned to read entire novels, and the beautiful math that made it possible*

---

## The Original Sin of Attention

Here's the dirty secret that haunted the transformer from birth: self-attention is *quadratic*. Every token attends to every other token, which means doubling the sequence length quadruples the computation and memory. The original 2017 "Attention Is All You Need" paper trained on sequences of just 512 tokens — roughly a page of text.

For years, this wasn't a crisis. GPT-2 in 2019 used a 1,024-token window. GPT-3 in 2020 stretched to 2,048. These were plenty for generating a paragraph or answering a short question. But they were embarrassingly inadequate for anything resembling *real work*: analyzing a contract, summarizing a research paper, holding a multi-turn conversation, or — the dream — reading an entire codebase.

The quadratic wall was concrete. At 2,048 tokens, the attention matrix has about 4.2 million entries. Manageable. At 32,768 tokens (a short book), you're at 1.07 billion entries. At 128,000 tokens, it's 16.4 billion. And at 1 million tokens — the frontier that Google's Gemini now claims — you'd need 1 *trillion* entries in a single attention matrix per layer per head. The naive approach doesn't just slow down; it becomes physically impossible.

The race to extend context windows is one of the most consequential engineering battles in AI. It's the difference between a model that can answer trivia and one that can serve as your lawyer, doctor, or research assistant. And it required reinventing how transformers understand the very concept of *position*.

## The Position Problem: How Does a Transformer Know Where It Is?

Attention, by itself, is *permutation invariant*. If you shuffled all the tokens in a sentence, the attention mechanism wouldn't notice — it just computes similarity scores between all pairs. "The cat sat on the mat" would look identical to "mat the on sat cat the." Obviously, word order matters enormously in language, so transformers need some way to encode *position*.

The original transformer used **absolute sinusoidal positional encodings**. Each position got a unique vector made of sine and cosine waves at different frequencies, added directly to the token embedding. Position 1 always gets the same vector, position 2 always gets the same vector, and so on. This is elegant and requires no learned parameters, but it has a fatal flaw: the model can only handle positions it saw during training. Train on positions 0-511, and position 512 is alien territory. The encodings exist mathematically, but the model has no idea what to do with them.

Later models like GPT-3 switched to **learned positional embeddings** — just a lookup table of trainable vectors, one per position. This works slightly better within the training range but is even worse at extrapolation. There's literally no embedding for positions beyond the table's length.

This created a hard wall. Your model could be brilliant, but it could only read documents that fit in its predefined window. Everything else got truncated, chunked, or ignored. For years, the field accepted this as a fundamental limitation.

Then came two ideas that shattered the wall.

## RoPE: Rotating Your Way to Longer Context

In April 2021, Jianlin Su and colleagues published a deceptively simple paper introducing **Rotary Position Embeddings** (RoPE). The idea is gorgeous: instead of *adding* a position signal to each token, you *rotate* the query and key vectors based on their position.

Here's the intuition. Imagine each dimension-pair of a query or key vector as a point on a 2D plane. For a token at position *m*, you rotate that point by an angle proportional to *m*. Different dimension-pairs rotate at different speeds — some spin fast (capturing short-range relationships), others spin slowly (capturing long-range ones), much like the different frequencies in the original sinusoidal encoding.

The magic is what happens when you compute attention. The dot product between a query at position *m* and a key at position *n* depends only on the *difference* (m - n), not on the absolute positions. This is **relative** position encoding, baked directly into the attention computation with zero additional parameters. A token 5 positions away looks the same whether it's at positions (10, 15) or positions (1000, 1005).

RoPE, introduced in the RoFormer paper, was quickly adopted by LLaMA (2023), and through LLaMA's influence became the *de facto* standard. Virtually every major open-weight model — LLaMA 2, LLaMA 3, Mistral, Qwen, DeepSeek, Yi, Falcon — uses RoPE. Even proprietary models are widely believed to use it or close variants.

But RoPE alone doesn't solve the context length problem. A model trained with RoPE at 4,096 tokens still struggles at 8,192. The rotational frequencies the model learned are calibrated for the training length. Go beyond it, and the rotations reach angles the model never encountered, causing performance to collapse.

The breakthrough came from a surprisingly simple trick: **adjusting the rotation speed**.

### YaRN, NTK-Aware Scaling, and the Art of Stretching

In mid-2023, researchers discovered that you could extend a RoPE model's context by modifying the base frequency parameter. The original RoPE uses a base of 10,000. By increasing this to, say, 500,000 or 1,000,000, the rotations slow down, effectively "stretching" the position encoding to cover a longer range.

**NTK-aware interpolation** (from the Reddit user "bloc97," in a remarkable instance of anonymous internet research advancing the field) showed that you shouldn't uniformly stretch all frequencies. High-frequency components should be left mostly alone (they handle local structure, which doesn't change with context length), while low-frequency components need more stretching. This non-uniform scaling preserves short-range performance while enabling long-range extension.

**YaRN** (Yet another RoPE extensioN), from Peng et al. in late 2023, refined this further with a temperature-based attention scaling factor. The result: a model trained at 4K context could be extended to 128K with minimal fine-tuning — sometimes just 200-400 steps on long documents.

Meta used exactly this approach for LLaMA 3.1. The base model was trained at 8,192 tokens, then extended to 128,000 tokens during a dedicated long-context fine-tuning stage. The RoPE base frequency was increased from 500,000 (already high) with careful frequency-aware adjustments. DeepSeek-V2 pushed to 128K similarly. Qwen-2.5 models support 128K. Google's Gemini 1.5 claims 1 million tokens (more on that shortly).

## ALiBi: The Linear Bias That Almost Won

Before RoPE conquered the world, a competing approach had a strong claim on the throne. In 2021, Ofir Press, Noah Smith, and Mike Lewis at Meta proposed **ALiBi** (Attention with Linear Biases). The idea is almost comically simple: don't encode position in the embeddings at all. Instead, add a linear penalty to attention scores based on distance.

If token *i* is attending to token *j*, subtract *m* × |*i* - *j*| from the attention score, where *m* is a head-specific slope. Nearby tokens get a small penalty (strong attention). Distant tokens get a large penalty (weak attention). That's it. No rotations, no learned parameters, no sine waves. Just a linear tax on distance.

The slopes *m* are set as a geometric sequence — each head has a different slope, so some heads are "nearsighted" (large *m*, strong distance penalty) and others are "farsighted" (small *m*, can attend to distant tokens). This gives the model a range of attention scales without any learning.

ALiBi's killer feature was **extrapolation**. A model trained on 1,024 tokens could be used at 2,048 or even 4,096 tokens with almost no degradation. The linear bias naturally generalizes to unseen positions because the penalty is a smooth function. Press et al. showed their 1.3B parameter model trained on 1K tokens performed nearly as well at 2K tokens on perplexity benchmarks.

ALiBi was adopted by several notable models: BLOOM (BigScience's 176B parameter multilingual model), MPT (MosaicML's series), and Falcon. But it ultimately lost the popularity contest to RoPE, largely because the RoPE ecosystem developed stronger extension techniques. ALiBi's linear penalty, while great for extrapolation, can be too aggressive for very long sequences — tokens 100K positions away get such a massive penalty that the model effectively ignores them, even when the information is critical.

## Ring Attention: Distributing the Impossible

RoPE and ALiBi address how models *encode* position. But there's a harder problem: how do you actually *compute* attention over 1 million tokens when the attention matrix doesn't fit in any single GPU's memory?

An A100 GPU has 80GB of memory. For a million-token sequence, even in half-precision (FP16), the attention matrix for a single head would be 1M × 1M × 2 bytes = 2 terabytes. You need something fundamentally different.

**Ring Attention**, introduced by Hao Liu, Matei Zaharia, and Pieter Abbeel at UC Berkeley in late 2023, is a beautifully elegant solution. The idea: distribute the sequence across multiple devices in a *ring topology*, and overlap communication with computation so that the context length scales linearly with the number of devices, with near-zero communication overhead.

Here's how it works. Suppose you have 8 GPUs, each holding a 128K-token chunk of a 1M-token sequence. Each GPU starts by computing attention for its own chunk (a local operation). Then, in a ring pattern, each GPU sends its key-value pairs to the next GPU and receives key-value pairs from the previous one. While the network transfer is happening, the GPU computes attention against the newly received chunk. After 7 rounds, every GPU has attended to every chunk of the sequence.

The trick is that the network transfer and computation happen *simultaneously*. As long as computation takes at least as long as communication (which it does, because attention is compute-heavy), the ring pattern adds zero wall-clock overhead. You can process a sequence of length N × D (where D is the number of devices) in essentially the same time it takes one device to handle length N.

Google reportedly uses ring attention (or a closely related variant) in Gemini 1.5, enabling its 1-million-token and 2-million-token context windows. The February 2024 technical report describes "a novel combination of multiple critical algorithmic improvements" including a ring-attention-like mechanism distributed across TPU pods. The team demonstrated processing a 1M-token context (equivalent to about 700,000 words, or 11 hours of audio, or 1 hour of video at 1fps) and correctly answering questions about a needle hidden within that haystack.

## FlashAttention: The GPU Whisperer

While ring attention solves the *multi-device* problem, **FlashAttention** solved the *single-device* problem — and it arguably had an even larger practical impact.

Tri Dao, then a Stanford PhD student, published FlashAttention in May 2022 with a simple observation: the standard attention implementation is **memory-bound**, not compute-bound. GPUs have a hierarchy of memory — small-but-fast SRAM (on-chip, ~20MB on an A100) and large-but-slow HBM (off-chip, 80GB on an A100). Standard attention writes the enormous N×N attention matrix to HBM, then reads it back. This memory traffic is the bottleneck, not the actual multiply-add operations.

FlashAttention uses a technique called **tiling**: it computes attention in blocks that fit entirely in SRAM, never materializing the full attention matrix in HBM. The key algorithmic insight is that softmax can be computed incrementally — you don't need to see all the scores to start normalizing. By keeping running statistics (the maximum value and sum of exponentials), each tile can compute its portion of the output, and the results are merged at the end using the *online softmax* trick (from Milakov and Gimelshein, 2018).

The results were dramatic. FlashAttention was 2-4× faster than standard PyTorch attention and used O(N) memory instead of O(N²). FlashAttention-2 (2023) pushed further with better work partitioning, reaching 50-73% of theoretical peak FLOPS on A100s. FlashAttention-3 (2024) exploited Hopper architecture features on H100 GPUs, including asynchronous memory operations and FP8 tensor cores, reaching 75%+ of peak.

This isn't an optional optimization. FlashAttention is now the default attention implementation in essentially every serious training and inference framework: Hugging Face Transformers, vLLM, TensorRT-LLM, and more. Without it, current context lengths would be roughly 4× shorter or 4× more expensive.

## The Needle in the Haystack: Can Models Actually *Use* Long Context?

Here's the uncomfortable question: just because a model *accepts* 128K or 1M tokens, does it actually *use* all that information? 

In November 2023, Greg Kamradt created the **"Needle in a Haystack"** (NIAH) test: hide a specific fact (the "needle") at various positions within a long document (the "haystack"), then ask the model to recall it. The original results were sobering. GPT-4 Turbo (128K context) reliably found needles at the beginning and end of its context but struggled with needles buried in the middle — the infamous **"lost in the middle"** phenomenon, first documented by Liu et al. at Stanford in mid-2023.

This wasn't just a GPT-4 problem. Multiple studies showed that models of all sizes exhibited a U-shaped recall curve: strong at the start (primacy bias from pretraining data structure) and at the end (recency bias from attention patterns), but weak in the middle.

Gemini 1.5 Pro made headlines in early 2024 by achieving near-perfect NIAH performance across its entire 1M-token window — reportedly above 99.7% recall at all positions. Claude 3 showed strong performance across its 200K window. GPT-4o improved over GPT-4 Turbo. The "lost in the middle" problem, while not fully solved, has been dramatically reduced through better training data (including long-document examples) and architectural improvements.

But NIAH is an *easy* test — it just asks for retrieval of a single fact. More challenging evaluations like **RULER** (from Hsieh et al., 2024) test multi-hop reasoning, variable tracking, and information aggregation across long contexts. On RULER, performance degrades much more significantly. At 128K tokens, even the best models show 10-20% drops compared to their 4K performance. Long context is increasingly *available* but not yet *free* — using it well remains an active research challenge.

## The Surprising Economics of Long Context

Here's a counterintuitive fact: **a 1M-token context window might be cheaper than you'd think, but the cost is front-loaded in a way that changes how you use it.**

Under the quadratic attention model, processing 1M tokens should cost ~1000× more than processing 1K tokens. But with FlashAttention, ring attention, and efficient KV-cache management, the actual scaling is much more favorable. Google prices Gemini 1.5 Pro at $1.25 per million input tokens (for contexts under 128K) and $2.50 per million for longer contexts. Processing a full 1M-token context costs about $2.50 in API fees — less than a fancy coffee.

The *real* cost is in the **KV cache**. During inference, every token's key and value vectors must be stored for future tokens to attend to. For a model like LLaMA 3 70B with 80 layers, 64 KV heads, and 128 dimensions per head, each token requires 80 × 64 × 128 × 2 (K and V) × 2 bytes (FP16) = ~2.6 MB. At 128K tokens, that's 335 GB of KV cache — more than four A100 GPUs' worth of memory, just for one user's conversation state.

This is why techniques like **Grouped-Query Attention (GQA)** and **Multi-Query Attention (MQA)** are so critical. GQA, used in LLaMA 2 70B and LLaMA 3, shares key-value heads across multiple query heads — if you have 64 query heads but only 8 KV heads, you reduce KV cache by 8×. Multi-query attention (used in Falcon and PaLM) takes this to the extreme with just 1 KV head, giving a 64× reduction.

DeepSeek-V2 introduced **Multi-head Latent Attention (MLA)**, which compresses the KV cache even further by projecting keys and values into a low-rank latent space. Their 236B parameter model uses just 512 dimensions for the compressed KV representation, regardless of the number of heads — reducing KV cache by about 93% compared to standard multi-head attention. This is how DeepSeek offers competitive pricing at a fraction of the infrastructure cost.

## What's Coming: Infinite Context?

The frontier is moving fast. Several approaches aim to break through the current ceiling:

**Mamba and state-space models** (from Gu and Dao, 2023) replace attention entirely with a mechanism that processes sequences in O(N) time and constant memory. Mamba-2 showed competitive performance with transformers on many benchmarks. Hybrid architectures like Jamba (from AI21) combine Mamba layers with attention layers, getting the best of both worlds: linear-time processing of most tokens with selective attention for the critical ones.

**Landmark attention and token eviction** strategies selectively drop or compress tokens that appear unimportant, maintaining a fixed-size "working memory" within an arbitrarily long stream. StreamingLLM (from Xiao et al. at MIT, 2023) showed that keeping just the first few tokens (which serve as "attention sinks") plus a recent sliding window allows infinite-length streaming with minimal performance loss.

**Memory-augmented approaches** like Memorizing Transformers (from Wu et al. at Google, 2022) add an external key-value store that the model can query using attention, effectively unbounding the context while keeping compute fixed.

The holy grail is a model that can ingest *everything* — your entire email history, all your documents, a full codebase — and reason over it as naturally as a human expert who's read it all. We're not there yet, but the trajectory from 512 tokens in 2017 to 2 million tokens in 2024 suggests the next order of magnitude isn't far away.

---

*Tomorrow, we go from context to speed: **inference optimization**. Once you've got a model with a massive context window, how do you make it respond in milliseconds? We'll explore the KV cache in depth, speculative decoding (where a small model drafts and a large model checks), quantization (running 70B models on a laptop), and why serving LLMs is as much an engineering challenge as training them.*

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Time!

Test your understanding of today's lesson:

**[Take the Day 18 Quiz](quizzes/day-18.toml)**

</div>
