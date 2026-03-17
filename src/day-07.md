# Day 7: Scaling Laws — Why Bigger Models Are Smarter

*You've spent a week learning about the machinery: tokenizers, attention, Transformers, pre-training objectives. Now we confront the most profound empirical discovery in modern AI — that the performance of language models follows precise, predictable mathematical laws as you scale them up. Not vague trends. Actual power laws with known exponents. This single insight has shaped hundreds of billions of dollars in investment decisions, driven the construction of supercomputer-scale GPU clusters, and sparked a race where the question isn't whether bigger models work better, but exactly how much compute, data, and parameters you should allocate to get the most intelligence per dollar.*

---

## The Discovery That Changed Everything

In January 2020, a team of researchers at Johns Hopkins and OpenAI — Jared Kaplan, Sam McCandlish, Tom Henighan, Tom Brown, Benjamin Chess, Rewon Child, and others — published a paper called "Scaling Laws for Neural Language Models" that would reshape the entire field. Their finding was stunning in its simplicity: if you plot the cross-entropy loss of a language model against the number of parameters, the amount of training data, or the amount of compute used, you get remarkably clean straight lines on a log-log plot.

Straight lines on a log-log plot mean **power laws**. The loss L follows equations like:

**L(N) ∝ N^(−0.076)** for parameters  
**L(D) ∝ D^(−0.095)** for dataset size  
**L(C) ∝ C^(−0.050)** for compute budget  

These exponents are small, which means you need order-of-magnitude increases in scale to get noticeable improvements. But the lines are remarkably smooth — spanning over **seven orders of magnitude** in compute. There's no cliff, no plateau, no magic threshold. Just a steady, predictable march downward.

Think about how unusual this is. In most engineering disciplines, you hit diminishing returns fast. A car engine twice as big doesn't go twice as fast. A building twice as tall doesn't house twice as many people. But language models? Double the compute, and you get a perfectly predictable drop in loss. Every single time.

## What "Loss" Actually Means in Practice

Before we go further, let's be precise about what's improving. Cross-entropy loss measures how well the model predicts the next token. A loss of 3.0 means the model is roughly as uncertain as if it were choosing among 20 equally likely tokens (e^3 ≈ 20). A loss of 2.0 narrows that to about 7 options. A loss of 1.5 means roughly 4.5 options.

These sound like small numerical changes, but they correspond to qualitatively different behaviors. A model at loss 3.0 produces garbled, barely coherent text. At 2.5, it's grammatically correct but factually unreliable. At 2.0, it starts exhibiting what we'd call "knowledge" — it can complete factual statements, follow instructions, and write passable prose. At 1.5, you're in the territory of models that can write legal briefs, debug code, and explain quantum mechanics.

The Kaplan scaling laws showed that these capability thresholds aren't random — they're milestones on a smooth curve that you can predict before training even begins. If you know your compute budget, you can estimate the final loss. And from the loss, you can roughly predict what the model will and won't be capable of.

## The Kaplan Recipe: Parameters Over Data

The original Kaplan et al. paper drew a specific practical conclusion that would guide OpenAI's strategy for years: **when you have a fixed compute budget, you should prioritize making the model bigger rather than training it on more data**.

Their analysis suggested that if you 10× your compute, you should roughly 5.5× your parameters but only 1.8× your data. The optimal model is undertrained — it hasn't seen enough data to fully converge — but it's big. This led to a philosophy of "make the model as large as possible and don't worry too much about training it to convergence."

This is exactly what OpenAI did with GPT-3. Released in June 2020 — just months after Kaplan's paper — GPT-3 had **175 billion parameters** trained on roughly **300 billion tokens**. By modern standards, that's a severely undertrained model (a ratio of less than 2 tokens per parameter). But it was enormous for its time, and it worked spectacularly. GPT-3 demonstrated few-shot learning, code generation, and creative writing at a level nobody had seen before.

The Kaplan recipe seemed vindicated. Scale parameters. Scale fast. Don't look back.

## Chinchilla: The Plot Twist

Two years later, a team at DeepMind dropped a bombshell. Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, and colleagues published "Training Compute-Optimal Language Models" in March 2022 — the paper universally known as **Chinchilla**.

They ran over 400 training experiments, systematically varying model sizes from 70 million to 16 billion parameters and dataset sizes from 5 billion to 500 billion tokens. Their conclusion directly contradicted Kaplan: **parameters and data should be scaled equally**. If you 10× your compute, you should 3.16× both your parameters and your training data (since 3.16 × 3.16 ≈ 10).

The Chinchilla-optimal ratio works out to roughly **20 tokens per parameter**. A 70B parameter model should see about 1.4 trillion tokens. A 7B model should see about 140 billion.

To prove their point, they trained Chinchilla: a 70 billion parameter model on 1.4 trillion tokens. Despite being 4× smaller than the 280B parameter Gopher (DeepMind's previous flagship), Chinchilla matched or beat Gopher on virtually every benchmark. Same compute budget, radically different allocation — and the smaller, better-trained model won.

This was a wake-up call. It meant GPT-3 was, in Chinchilla terms, **roughly 5-7× too large for its data**. It should have been a ~30B model trained on more tokens. Billions of dollars of compute across the industry had been allocated suboptimally.

## Why Did Kaplan Get It Wrong?

The disagreement between Kaplan and Chinchilla isn't about the fundamental existence of scaling laws — both agree that performance follows power laws. The discrepancy comes down to methodology.

Kaplan et al. estimated the optimal allocation by training each model with a **fixed learning rate schedule** that didn't adjust based on the training duration. Their smaller models were trained for proportionally more steps, but without adjusting the learning rate cooldown, those models hadn't fully converged. This made data look less valuable than it actually was — the models were "trained" on more data but not actually learning from it efficiently because the learning rate was still too high.

Chinchilla used a cosine learning rate schedule that was properly tuned for each run length. With this fix, data became much more valuable, and the optimal balance shifted dramatically toward more data and fewer parameters.

It's a cautionary tale about how a seemingly minor experimental design choice — learning rate scheduling — can lead to conclusions that reshape an entire industry's capital allocation. One might argue this is the most expensive hyperparameter bug in history.

## The Chinchilla Tax and the Inference Revolution

But there's a deeper reason the industry didn't immediately adopt Chinchilla-optimal training, and it has to do with the economics of deployment.

Training a model is a one-time cost. Inference — actually running the model to serve user queries — is an ongoing expense that scales with every API call. And inference cost is dominated by **parameter count**, not training data. A 70B model costs roughly 10× more per query than a 7B model, regardless of how well either was trained.

This creates what practitioners call the **Chinchilla tax** problem, or more precisely, the "overtrain for inference" strategy. If you're going to serve billions of queries, it can be cheaper overall to train a smaller model for much longer than Chinchilla recommends, accepting a slightly higher loss in exchange for dramatically cheaper inference.

This is exactly what Meta did with **LLaMA** (February 2023). LLaMA-7B was trained on **1 trillion tokens** — about 7× the Chinchilla-optimal amount. LLaMA-13B saw the same 1T tokens, giving it a ratio of ~77 tokens per parameter, nearly 4× the Chinchilla recommendation. The result? LLaMA-13B matched GPT-3 (175B) on most benchmarks despite being 13× smaller.

Meta had found a practical loophole: you can trade extra training compute (a one-time cost) for a permanently cheaper model to deploy. The same insight drove Mistral-7B, Phi-2, and the entire class of "small models trained on massive data" that dominated 2023-2024.

## Beyond Chinchilla: The Frontier in 2025-2026

The original scaling laws described a world of compute-optimal training. But the frontier has moved far beyond that simple picture.

**DeepSeek's scaling work** showed that the laws hold even more cleanly than expected at extreme scale when you account for architecture choices like Mixture of Experts. DeepSeek-V2 (2024) demonstrated that MoE models follow their own scaling curves where you scale *active* parameters and total parameters independently — and MoE scales more efficiently because only a fraction of parameters are used per token.

**Llama 3** (April 2024) pushed the overtrained regime even further. The 8B model was trained on **15 trillion tokens** — nearly 2,000 tokens per parameter, roughly 100× the Chinchilla ratio. Meta reported that the loss was *still decreasing* when they stopped training, suggesting that even 15T tokens hadn't saturated what an 8B model could learn. This demolished any notion that small models have a fixed "capacity" that more data can't overcome.

**Epoch AI's analysis** (2025) estimated that frontier labs were hitting a different kind of wall: not a scaling law plateau, but a **data wall**. The total amount of high-quality text on the internet is roughly 10-15 trillion tokens. Models like GPT-4 and Claude 3 were trained on substantial fractions of all publicly available text. You can't scale data 10× if the data doesn't exist.

This has driven multiple responses: synthetic data generation (using models to create training data for other models), multi-epoch training (seeing the same data multiple times, which works but with diminishing returns — typically losing ~0.1 nats after 4 epochs), and multimodal training (adding images, video, audio, and code to the data diet).

## The Surprising Math of Emergence

Here's perhaps the most counterintuitive implication of scaling laws: **smooth loss curves produce discontinuous capabilities**.

Loss decreases gradually — there's no sudden jump at any particular scale. But specific capabilities appear to "emerge" at specific scales. A model at 10B parameters can't do multi-step arithmetic. At 100B, it suddenly can. A model at 50B can't reliably follow complex instructions. At 200B, it does so consistently.

How does this work? The answer lies in how loss connects to task performance. Imagine a task that requires the model to get 10 consecutive token predictions right. If each token has a 90% chance of being correct, the probability of getting all 10 right is 0.9^10 ≈ 35%. At 95% per token, it's 0.95^10 ≈ 60%. At 99%, it's 0.99^10 ≈ 90%.

That smooth improvement in per-token accuracy (90% → 95% → 99%) maps onto a loss reduction of just 0.15 nats. But the task success rate jumps from 35% to 90%. The scaling law is smooth; the benchmark is not. Emergence isn't magic — it's a **phase transition** driven by the nonlinear relationship between per-token accuracy and multi-step task completion.

This insight, formalized by researchers at Stanford and elsewhere, resolved one of the biggest debates in the field. Emergence is real in the sense that capabilities truly do appear at scale. But it's not mysterious — it's a predictable consequence of smooth underlying improvement hitting task-specific thresholds.

## What $100 Million Buys You (and Why It Matters)

Scaling laws turn AI into an exercise in capital allocation. Here's the rough math as of early 2026:

- **Training an 8B model on 1T tokens:** ~$2-3 million (on H100 clusters)
- **Training a 70B model on 2T tokens:** ~$20-30 million
- **Training a 400B+ frontier model on 10T+ tokens:** ~$100-300 million
- **GPT-4 training cost (estimated):** ~$100 million (2023 dollars)
- **Llama 3 405B:** Meta used ~30,000 H100 GPUs for months, estimated $50-100M+

The scaling laws tell you exactly what you get for that money. Doubling your compute budget reduces loss by about 3.4% (using the C^(−0.050) exponent). That doesn't sound like much, but that 3.4% might be the difference between a model that can and can't reliably write working code, or between one that hallucinates 30% of the time versus 20%.

This is why the GPU arms race is so intense. NVIDIA's H100s cost $25,000-40,000 each. A frontier training cluster needs 10,000-50,000 of them. The total cost including networking (InfiniBand at $400B+ for large clusters), power, cooling, and engineering staff means a single training run is a nine-figure bet. And the scaling laws give labs enough confidence to make that bet — because the returns are predictable.

## The Limits of Scaling

Are scaling laws eternal? Almost certainly not.

Several potential ceilings loom:

1. **Data exhaustion**: As mentioned, we're running low on high-quality training text. Synthetic data helps but introduces distributional biases.

2. **Hardware limits**: Even with NVIDIA's B200 and GB300 chips, you eventually hit power grid constraints. A 100,000-GPU cluster draws 50-150 megawatts — enough to power a small city.

3. **Diminishing economic returns**: Halving the loss might cost 100× the compute. At some point, the marginal improvement per dollar spent isn't worth it for commercial applications.

4. **Irreducible entropy**: Language itself has a floor of unpredictability. Shannon estimated English text has about 1.0-1.5 bits per character of entropy. No model can predict better than the inherent randomness in language. Current frontier models are approaching this theoretical floor on clean text.

5. **Benchmark saturation**: On many standard benchmarks (MMLU, HellaSwag, ARC), frontier models already score 90%+. The remaining errors are often ambiguous questions rather than model failures.

But here's the thing: every time someone has predicted the end of scaling, they've been wrong. The field keeps finding new dimensions to scale along — more data types, better data quality, architectural improvements that shift the scaling curves, and now **test-time compute scaling** (spending more computation during inference rather than training).

## The Philosophical Weight

Scaling laws have an almost unsettling implication: intelligence, or at least the kind of intelligence we measure with language benchmarks, might be a **commodity**. Not a mystical property that requires breakthrough algorithmic insight, but something you can buy with enough GPUs and data.

This is philosophically heavy. It suggests that the difference between a model that can barely string together grammatical sentences and one that can pass the bar exam is "just" a few orders of magnitude of compute. Not a different architecture. Not a different training procedure. Just... more.

Whether this generalizes to real understanding, reasoning, or consciousness is a different question entirely — one we'll grapple with later in this course. But the empirical fact stands: smooth scaling produces qualitatively different capabilities. And that's enough to make scaling laws the most important empirical finding in modern AI.

---

## What's Coming Tomorrow

You now know *that* bigger models are smarter, and roughly *how* to allocate compute for maximum intelligence per dollar. But we've been talking about scaling in the abstract — parameters, tokens, FLOPs. Tomorrow, we pull back the curtain on **the actual training stack**: the GPUs, the clusters, the networking, the data pipelines, and the staggering engineering required to keep thousands of accelerators working in concert. What does $100 million of training infrastructure actually look like? How do you keep 50,000 GPUs synchronized? And what happens when one of them fails mid-training? Welcome to Week 2.

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border: 1px solid #16213e;">

### 📝 Test Your Understanding

Ready to check what you've learned? Take the interactive quiz:

<a href="quizzes/day-07.html" style="display: inline-block; padding: 0.75rem 1.5rem; background: #e94560; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 0.5rem;">Take the Day 7 Quiz →</a>

</div>
