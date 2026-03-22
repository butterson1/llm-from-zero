# Day 19: Inference Optimization — KV Cache, Speculative Decoding, and Quantization

*Why generating a single token from a 70-billion-parameter model is less like doing math and more like waiting for a library book to arrive*

---

## The Dirty Secret: Inference Is Memory-Bound

Here's a fact that surprises almost everyone who first encounters it: when a large language model generates text one token at a time, your GPU's thousands of compute cores sit mostly *idle*. The bottleneck isn't computation — it's memory bandwidth. The GPU spends most of its time *waiting for data to arrive from memory*, not crunching numbers.

To understand why, you need one number: **arithmetic intensity**, the ratio of floating-point operations to bytes moved from memory. An NVIDIA A100 GPU can perform 312 trillion FP16 operations per second (312 TFLOPS), but its memory bandwidth is "only" 2 terabytes per second. That means the GPU needs about 156 FLOPs per byte loaded to fully saturate its compute units. This is the *ridge point* on what hardware engineers call the **roofline model** — the crossover where a workload transitions from memory-bound to compute-bound.

During autoregressive token generation, each new token requires reading the *entire* model's weights from GPU memory. For Llama 3 70B in FP16, that's 140 GB of weights read for every single token generated. The actual math — a handful of matrix-vector multiplications — performs roughly 2 FLOPs per parameter, giving an arithmetic intensity of about 1 FLOP per byte. That's 156× below the ridge point. The GPU's compute capability is being used at less than 1% of its theoretical peak.

This is the fundamental insight that drives every optimization we'll cover today: **LLM inference is a memory bandwidth problem masquerading as a compute problem**. Every technique — KV caching, quantization, speculative decoding — is ultimately a clever way to either move less data, move it more efficiently, or get more useful work done per byte moved.

## The KV Cache: Trading Memory for Time

Every time a transformer generates a new token, it computes attention over the entire sequence so far. Without any optimization, generating the 1,000th token would require recomputing the key and value projections for all 999 preceding tokens — work that was already done when generating tokens 1 through 999. This is spectacularly wasteful.

The **KV cache** is the solution: store the key and value vectors from every previous token's attention computation, so they never need to be recomputed. When generating token 1,000, you only compute the query, key, and value for the *new* token, then look up the cached keys and values for positions 1–999.

This sounds like an obvious optimization, and it is — but the memory cost is staggering. For each token in the sequence, the KV cache stores two vectors (K and V) per attention head per layer. The formula:

**KV cache size = 2 × num_layers × num_kv_heads × head_dim × sequence_length × bytes_per_element**

For Llama 3 70B with its 80 layers, 8 KV heads (using Grouped Query Attention), and 128-dimensional heads in FP16: each token costs about 2 × 80 × 8 × 128 × 2 = 327,680 bytes, roughly 320 KB per token. At a 128K context length, that's **40 GB per request** — almost a third of an A100's total memory, and that's *after* the GQA optimization reduced KV heads from 64 to 8. With the original Multi-Head Attention design, it would be 320 GB per request. Completely infeasible.

Now imagine serving hundreds of concurrent users. If each request has a 4K context, Llama 3 70B needs about 1.3 GB of KV cache per request. Serving 100 concurrent requests means 130 GB just for KV caches — nearly the entire memory of an H100 GPU (80 GB) or even an H200 (141 GB). The model weights themselves need another 140 GB in FP16. The math simply doesn't work without aggressive optimization.

### PagedAttention: Virtual Memory for AI

The most impactful KV cache optimization came from an unexpected source: operating systems research. In 2023, UC Berkeley's Kwon et al. published **PagedAttention**, the technique behind vLLM, and it borrowed directly from how operating systems manage RAM.

The problem: traditional inference engines pre-allocate a contiguous block of GPU memory for each request's KV cache, sized for the maximum possible sequence length. If a request might generate up to 2,048 tokens but actually only produces 200, the remaining 1,848 token slots sit allocated but unused. Across many concurrent requests, this **internal fragmentation** wastes 60–80% of KV cache memory.

PagedAttention solves this the same way virtual memory solved RAM fragmentation in the 1960s. Instead of contiguous blocks, KV caches are stored in small, fixed-size **pages** (typically 16 tokens each). Pages are allocated on demand and can be physically scattered across GPU memory while appearing contiguous to the attention computation. A simple page table maps logical token positions to physical memory locations.

The results are dramatic: vLLM reduces KV cache memory waste to under 4%, enabling 2–4× higher throughput compared to naive implementations like HuggingFace's text-generation-inference at launch. Better yet, PagedAttention enables **copy-on-write** sharing — if multiple requests share a common prefix (like the same system prompt), their KV cache pages for that prefix point to the same physical memory. For a busy API serving thousands of requests with identical system prompts, this can save gigabytes.

### Beyond Paging: Compressing the Cache Itself

Even with perfect memory management, the KV cache remains enormous. Several approaches directly compress its contents:

**Multi-Query Attention (MQA)** and **Grouped Query Attention (GQA)**, which we touched on in Day 18, reduce the number of KV heads. Original multi-head attention gives each head its own K and V — wasteful because heads often learn redundant representations. MQA (used in PaLM, Falcon) collapses all KV heads into one, reducing KV cache by the number of heads (e.g., 32×). GQA (used in Llama 2 70B, Llama 3) is a compromise: 8 KV head groups shared across 64 query heads, giving an 8× reduction with minimal quality loss.

**Multi-head Latent Attention (MLA)**, introduced in DeepSeek-V2, takes this further by projecting KV pairs into a low-rank latent space — compressing the cached representation by 93.3% while maintaining quality through a clever joint compression of keys and values into a single latent vector per token.

**KV cache quantization** applies lower precision specifically to cached values. Research from Microsoft and others shows you can quantize the KV cache to INT4 or even INT2 with surprisingly little degradation, since the attention softmax makes the computation robust to small perturbations in key/value magnitudes. This can halve or quarter the cache memory independently of model weight quantization.

## Quantization: The Art of Controlled Imprecision

If inference is memory-bandwidth-bound, the most direct solution is to make the model *smaller*. Not architecturally — you keep all the parameters — but by representing each weight with fewer bits. This is **quantization**, and it's the single most impactful technique for making LLMs practical.

A standard FP16 model uses 16 bits per parameter. Llama 3 70B at FP16 occupies 140 GB. At INT8, it's 70 GB — fits on a single A100. At INT4, it's 35 GB — fits on a consumer RTX 4090 with room to spare for KV cache. At the extreme, some models have been quantized to 2 or even 1.58 bits (BitNet) and still produce coherent text.

But quantization isn't just "round to fewer bits." The challenge is doing it without destroying the model's capabilities. The landscape of quantization methods is surprisingly rich:

### Post-Training Quantization (PTQ)

These methods quantize a pre-trained model without retraining:

**GPTQ** (Frantar et al., 2022) was the first practical method for accurate 4-bit quantization of large models. It processes weights one layer at a time, using a small calibration dataset (typically 128 examples) to find the quantization that minimizes output error. The key insight is using the inverse Hessian — the curvature of the loss landscape — to determine which weights are most sensitive and should be quantized more carefully. GPTQ can quantize a 175B-parameter model in about 4 hours on a single GPU.

**AWQ** (Lin et al., 2023) — Activation-aware Weight Quantization — observed that only about 1% of weights are truly critical, and they correspond to channels with large activation magnitudes. Rather than quantizing all weights equally, AWQ scales important weight channels *up* before quantization (and scales activations down to compensate), effectively giving salient weights more quantization bins. This produces consistently better quality than GPTQ at 4-bit, and the approach is elegant: you're not protecting weights that are *large*, you're protecting weights that *matter* — the ones connected to high-activation channels.

**GGUF** (the format behind llama.cpp) takes a different approach optimized for CPU and mixed CPU/GPU inference. It uses **k-quant** methods like Q4_K_M that partition weights into blocks, compute per-block scaling factors, and apply different bit-widths to different blocks based on importance. The "K" quantization preserves quality remarkably well: Q4_K_M typically retains 97–99% of the original model's perplexity while using 4.5 bits per weight on average. This is what lets people run 70B models on laptops with 32 GB of RAM.

### The Marlin Kernel Revolution

Raw quantization doesn't automatically mean faster inference. A naively-quantized INT4 model might actually run *slower* than FP16, because the GPU has to dequantize on the fly with unoptimized code. The **Marlin kernel** (developed by IST Austria and Neural Magic) changed this completely. Marlin is a hand-optimized CUDA kernel for INT4 matrix multiplication that achieves near-ideal memory bandwidth utilization on NVIDIA GPUs.

The numbers tell the story: on an A100, GPTQ without Marlin runs at 276 tokens/second. With Marlin, the same quantized model hits 741 tokens/second — a 2.7× speedup just from better GPU kernel engineering. AWQ with Marlin achieves similar gains. This is why quantization format *and* runtime matter — a well-engineered 4-bit system doesn't just save memory, it's genuinely faster than FP16.

### Quantization-Aware Training

Some models are now *trained* to work at low precision. **BitNet b1.58** (Microsoft Research, 2024) trains with ternary weights — each weight is literally -1, 0, or +1. At 1.58 bits per parameter, a 70B-parameter model would occupy just 14 GB. The stunning finding: BitNet b1.58 matches FP16 Llama at 3B parameters on language modeling benchmarks, while using 71% less energy for matrix multiplication. The trick is that the model *learns* to work with ternary weights during training, developing different internal representations than a model trained in FP16 and then crudely quantized.

## Speculative Decoding: The Trick That Shouldn't Work

Here's the counterintuitive optimization: to make a *big, slow* model generate text faster, have a *small, fast* model generate text first, then let the big model check the work.

This is **speculative decoding**, independently proposed by Leviathan et al. at Google and Chen et al. at DeepMind in 2023. It exploits the asymmetry between autoregressive generation (inherently serial — one token at a time) and verification (parallelizable — check many tokens at once).

The algorithm works like this:

1. A small **draft model** (say, Llama 3 8B) generates *k* candidate tokens autoregressively. This is fast because the model is small.
2. The large **target model** (say, Llama 3 70B) processes all *k* candidates in a single forward pass, computing the probability distribution for each position.
3. Using a clever **rejection sampling** scheme, tokens are accepted or rejected by comparing the draft and target distributions. Accepted tokens are kept; the first rejected token is resampled from a corrected distribution.

The magic: this produces *exactly* the same output distribution as running the target model alone. Not approximately — mathematically identical. There's no quality loss whatsoever. You're paying the compute cost of running both models, but the wall-clock time drops because you're turning *k* serial decode steps into one parallel verification step.

How much faster? It depends on the **acceptance rate** — how often the draft model's predictions match the target model's. For well-matched model pairs (same family, different sizes), acceptance rates of 70–85% are typical, yielding 2–3× speedups. Google reports speculative decoding providing up to 2× reduction in inference latency for their production PaLM models.

The name isn't accidental — it's directly inspired by **speculative execution** in CPUs, where processors execute instructions ahead of time along predicted branches and discard the work if the prediction was wrong. The economics are identical: speculation is free when you have spare compute capacity, and LLM autoregressive decoding has enormous spare capacity (remember, the GPU is mostly idle waiting for memory).

### Self-Speculative Decoding

You don't even need a separate draft model. **Self-speculative decoding** uses the target model itself as the draft, but skips certain layers during the draft phase. Llama 3 70B has 80 transformer layers; running only 20 of them produces a rough-but-useful draft at 4× the speed. The full 80-layer model then verifies. This eliminates the need to deploy a separate draft model and avoids alignment issues between different model families.

**Medusa** (Cai et al., 2024) takes yet another approach: it adds multiple small prediction heads to the target model, each head predicting a different *future* token. The model simultaneously predicts tokens at positions *t+1, t+2, t+3, ...* during a single forward pass. A tree-structured verification scheme then determines how many of these predictions are correct. Medusa can achieve 2–3× speedup with minimal additional parameters (just the lightweight heads).

## Putting It All Together: The Modern Inference Stack

In production, these techniques combine multiplicatively:

1. **Quantize** the model to INT4 with AWQ or GPTQ + Marlin kernels (4× memory reduction, 2× speed increase)
2. **Serve** with vLLM or SGLang using PagedAttention (2–4× higher throughput via better memory utilization)
3. **Compress KV cache** with GQA and cache quantization (4–8× reduction in per-request memory)
4. **Accelerate generation** with speculative decoding (2–3× latency reduction)

The compound effect is enormous. A naive FP16 implementation serving Llama 3 70B might handle 5–10 requests per second on an 8×A100 cluster. A fully optimized stack with all these techniques can serve 50–200+ requests per second on the same hardware. The difference between a research demo and a viable product.

Serving frameworks like **vLLM**, **TensorRT-LLM** (NVIDIA), and **SGLang** (Berkeley) integrate these optimizations into production-ready systems. vLLM alone processes over 2 million requests per day for several major AI companies. SGLang adds **RadixAttention**, which extends KV cache sharing to arbitrary shared prefixes across a tree of related requests — perfect for multi-turn conversations where earlier turns are shared.

## The Economics That Drive Everything

Why does all this optimization matter? Because inference costs dwarf training costs over the lifetime of a model. OpenAI reportedly spends more on serving GPT-4 in a single month than the ~$100 million it cost to train it. Meta estimated that 80–90% of total ML infrastructure spending goes to inference, not training.

At cloud prices, an H100 GPU costs roughly $2–3 per hour. Serving Llama 3 70B at FP16 requires at least two H100s (160 GB for weights alone), costing $4–6/hour before accounting for KV cache memory, redundancy, and networking overhead. At INT4 with GQA-optimized KV cache, a single H100 can do the job: $2–3/hour, and at 3× the throughput. Quantization alone can cut per-token costs by 6–10×.

This is why quantized open-weight models running on commodity GPUs are disrupting the API business. A 4-bit Llama 3 70B on a $1,600 RTX 4090 can serve a small team at near-zero marginal cost. The same quality through an API would cost thousands per month. The inference optimization stack has made the economics of self-hosting genuinely competitive for the first time.

---

*Tomorrow, we flip the script: instead of making big models smaller, we'll explore how **small models that punch above their weight** achieve remarkable capability through distillation, pruning, and LoRA — and why a 7B model trained right can outperform a lazy 70B model.*

---

## Test Your Knowledge

<a href="quizzes/day-19.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 19 Quiz →</a>
