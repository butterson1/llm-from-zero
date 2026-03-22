# Day 16: Claude, Gemini, Llama — How Other Labs Diverged from GPT

*OpenAI drew the map, but the most interesting AI story of 2023-2025 is what happened when other labs decided to take different roads — and sometimes found better ones.*

---

By the time GPT-4 launched in March 2023, the playbook seemed obvious. Take a decoder-only transformer. Train it on trillions of tokens of internet text. Scale it up. Apply RLHF. Ship an API. That's how you build a frontier model.

Except it wasn't that simple. Within 18 months, at least five organizations had produced models that matched or exceeded GPT-4 on major benchmarks — and nearly all of them had made architectural, training, or philosophical decisions that deviated significantly from OpenAI's approach. The result is the most fascinating natural experiment in AI history: multiple teams with billions of dollars, access to similar research, and different theories about what matters most, all racing toward the same goal from different directions.

What they built — and why they built it differently — tells us far more about the nature of intelligence than any single model ever could.

## Anthropic: The Safety Lab That Became a Capabilities Lab

Anthropic's origin story reads like a Silicon Valley soap opera. In late 2020 and early 2021, Dario Amodei (VP of Research), his sister Daniela Amodei (VP of Operations), and about a dozen senior researchers — including Tom Brown, the first author of the GPT-3 paper — walked out of OpenAI. Their stated reason: disagreements about the pace and safety culture of AI development. Their unstated advantage: they knew exactly how GPT-3 had been built, and they had ideas about how to do it better.

The first Claude model, launched in March 2023, was roughly GPT-3.5-tier. Claude 2, arriving in July 2023, closed the gap further. But it was **Claude 3**, released in March 2024, that changed the conversation entirely. The Opus variant matched or exceeded GPT-4 on most benchmarks — MMLU (86.8% vs. GPT-4's 86.4%), graduate-level reasoning (GPQA at 50.4%), and coding (HumanEval at 84.9%) — while exhibiting noticeably different behavioral characteristics.

What made Anthropic's approach distinctive wasn't just Constitutional AI, which we covered on Day 12. It was a constellation of design choices:

**Long context as a first-class feature.** While GPT-4 launched with an 8K context window (later expanded to 128K), Claude 2 shipped with a 100K-token context window from day one. Claude 3 pushed this to 200K tokens, with an effective retrieval accuracy above 99% across the full window — the famous "needle in a haystack" test. This wasn't just a larger number; it required fundamental changes to how attention is computed and how positional information is encoded. Anthropic invested heavily in making long context *actually work*, not just technically fit in memory.

**Honesty over helpfulness.** Anthropic made an explicit choice to optimize for a different point on the helpfulness-honesty-harmlessness triangle. Early Claude models were notoriously cautious — sometimes frustratingly so — but this reflected a genuine architectural and training decision. The Constitutional AI approach means the model was trained to reason about its own responses before generating them, producing a distinctive "thinking through the problem" quality that users either loved or found verbose.

**Character training.** Starting with Claude 3, Anthropic began investing significantly in what they called the model's "character" — its tone, epistemic humility, and behavioral consistency. Claude was trained to say "I don't know" more readily, to resist sycophancy (telling users what they want to hear), and to maintain a consistent persona across conversations. This wasn't just RLHF tuning; it was baked into the constitutional principles themselves.

By Claude 3.5 Sonnet (released June 2024, updated October 2024), something surprising had happened. A model from the "safety lab" was consistently beating GPT-4o on coding benchmarks, agentic tasks, and instruction-following — not because Anthropic had abandoned caution, but because their particular approach to training turned out to produce models that were genuinely better at following complex, multi-step instructions. The safety research had become a capabilities advantage. Claude 3.5 Sonnet scored 93.7% on HumanEval and topped the SWE-bench Verified leaderboard at 49%, a benchmark that tests real-world software engineering.

## Google DeepMind: The Multimodal Bet

Google's AI story during this period is one of organizational chaos producing, almost despite itself, genuinely novel technical work.

When ChatGPT launched in November 2022, Google had two separate AI research organizations: Google Brain (which had invented the transformer in 2017) and DeepMind (the London-based lab famous for AlphaGo). In a panic-merger in April 2023, they were combined into Google DeepMind. The merger was messy. Researchers who had been competitors for years were suddenly on the same team. Projects overlapped. Priorities clashed.

Out of this chaos came **Gemini**, announced in December 2023. And despite the rocky organizational backdrop, Gemini represented the most ambitious architectural departure from the GPT playbook by any major lab.

The key insight: Google decided to build a **natively multimodal** model from the ground up. While GPT-4V and Claude 3 handled images by bolting a vision encoder (typically a ViT variant) onto a language model and training a projection layer between them, Gemini was trained from scratch on interleaved sequences of text, images, audio, and video. The training data wasn't "text, plus some images on the side" — it was genuinely mixed-modal from the first training step.

This mattered more than it might sound. In a bolt-on approach, the language model and vision encoder have fundamentally different internal representations that must be bridged. In Gemini's native approach, the model learns unified representations where text and visual concepts live in the same embedding space from the beginning. A picture of a cat and the word "cat" activate overlapping neural circuits, not separate ones connected by a thin bridge.

**Gemini 1.0 Ultra** — the largest variant — hit 90.0% on MMLU, making it the first model to credibly claim superhuman performance on that benchmark (the estimated expert human ceiling is around 89.8%). It used a Mixture-of-Experts architecture (more on that tomorrow), which Google had pioneered in their earlier Switch Transformer and GLaM models. The total parameter count was reportedly around 1.56 trillion, with roughly 300-500 billion active per forward pass.

But Google's most significant technical contribution might have been on the context length front. **Gemini 1.5 Pro**, released in February 2024, shipped with a 1-million-token context window — and later expanded to 2 million. To put this in perspective: GPT-4's 128K window could hold a long novel. Gemini 1.5's 1M window could hold approximately *ten* novels simultaneously, or the entire codebase of a substantial software project, or a full hour of video.

This wasn't achieved through brute force. The key innovations included **ring attention** (distributing attention computation across devices in a ring topology), **RoPE scaling** (extending Rotary Position Embeddings to positions far beyond training range), and aggressive attention sparsification. The model maintained strong recall performance across the full window — Google demonstrated it correctly identifying a single changed scene in a 45-minute video.

Gemini 2.0 Flash, arriving in late 2024, pushed further with native tool use, real-time audio/video streaming, and "agentic" capabilities — the ability to take multi-step actions in external environments. Google's unique asset here was integration: Gemini could natively search the web, execute code, and interact with Google's product ecosystem in ways that required API gymnastics from competitors.

## Meta's Llama: The Open Source Earthquake

If Anthropic's story is about safety becoming capability, and Google's is about multimodal architecture, Meta's is about something more fundamental: the decision to give it all away.

In February 2023, Meta released **LLaMA** (Large Language Model Meta AI) — a family of models from 7B to 65B parameters. The models themselves were impressive but not frontier-level. What was revolutionary was the license: Meta released the full model weights, allowing anyone to download, modify, and build upon them. Within a week, the weights had leaked to the broader internet. Within a month, an entire ecosystem had exploded into existence.

LLaMA was trained on 1.4 trillion tokens of publicly available data — a deliberate choice. By using only public data, Meta avoided the copyright quagmire that haunted models trained on proprietary books or paywalled content. The architecture was a relatively standard decoder-only transformer, but with three notable choices borrowed from recent research:

1. **RMSNorm** instead of LayerNorm (simpler, faster, from the 2019 Zhang & Sennrich paper)
2. **SwiGLU** activation functions (from Noam Shazeer's 2020 paper, roughly 1% better than ReLU at the same compute)
3. **Rotary Position Embeddings (RoPE)** instead of learned absolute positions (better extrapolation to unseen sequence lengths)

These weren't Meta innovations, but Meta's combination of them into a clean, well-trained package at multiple sizes created a foundation that the open-source community could actually use.

**LLaMA 2** (July 2023) scaled to 70B parameters and 2 trillion training tokens, with a chat-tuned variant that was arguably competitive with the original ChatGPT. **LLaMA 3** (April 2024) was the real leap: the 70B variant was trained on 15 trillion tokens — roughly 7.5× more data per parameter than the Chinchilla-optimal ratio would suggest. This was deliberate overtraining: Meta wanted the best possible model at inference time, even if training was compute-inefficient, because the model would be run billions of times after training. The 8B variant of LLaMA 3 outperformed the 70B LLaMA 2 on many benchmarks, demonstrating the power of data scaling at fixed model sizes.

**LLaMA 3.1 405B**, released in July 2024, was the crown jewel: a 405-billion-parameter model trained on 15.6 trillion tokens across 16,384 H100 GPUs. It matched GPT-4o and Claude 3.5 Sonnet on most benchmarks. This was a frontier-class model, available for anyone to download, fine-tune, and deploy. The training run consumed an estimated 30.84 million GPU-hours. At market H100 rental rates, that's roughly $60-100 million in compute alone.

Here's the counterintuitive part: **Meta makes no money from AI models directly.** They don't sell API access. They don't charge for the weights. The strategic logic is that open-source models commoditize the AI layer, preventing any single company from controlling it — which protects Meta's actual business (advertising) from being disrupted by an AI gatekeeper. If everyone has access to frontier AI, nobody can charge monopoly rents. It's the same logic IBM used when it open-sourced Eclipse, or Google used with Android.

The downstream effects were staggering. Thousands of fine-tuned variants appeared within weeks of each release. Quantized versions running on consumer hardware. Specialized models for medicine, law, code, every language under the sun. The entire field of efficient fine-tuning (LoRA, QLoRA, and their descendants) was essentially built on the LLaMA family.

## Mistral: The European Dark Horse

In a world of $100M+ training runs, Mistral AI proved that a small team with deep expertise could punch absurdly above its weight. Founded in May 2023 by Arthur Mensch, Guillaume Lample, and Timothée Lacroix — all former researchers at Meta and DeepMind — Mistral raised €385 million at a €2 billion valuation before shipping a single product.

**Mistral 7B**, released in September 2023, embarrassed the industry. A 7-billion-parameter model trained on undisclosed data outperformed LLaMA 2 13B on every benchmark tested. The key innovations were **Grouped-Query Attention (GQA)** — sharing key-value heads across multiple query heads, reducing memory requirements by 4-8× during inference — and **Sliding Window Attention (SWA)**, which limited each token's attention to a fixed window (4,096 tokens) while using stacked layers to achieve effective context lengths of 32K+ tokens. The result: faster inference, lower memory, and better performance than models twice its size.

**Mixtral 8x7B** (December 2023) was even more remarkable. It was one of the first high-quality open Mixture-of-Experts models: eight 7B expert networks with a routing mechanism that activates only 2 of the 8 for each token. Total parameters: 46.7 billion. Active parameters per token: ~13 billion. The result was a model with the quality of a 40B+ dense model at the computational cost of a ~13B model. It matched GPT-3.5-Turbo on most benchmarks while being fully open-weight.

Mistral's approach embodied a contrarian thesis: **architectural efficiency matters more than raw scale.** While everyone else was racing to train the largest possible model, Mistral focused on getting the maximum performance per FLOP at inference time. In a world where training happens once but inference happens billions of times, this might be the more economically rational approach.

## The Convergences and Divergences

Looking across all these efforts, a pattern emerges. Some things everyone agrees on:

**Decoder-only transformers won.** Despite Google's history with encoder-decoder models (T5, original Transformer), every frontier model from 2023 onward is decoder-only. The simplicity and scalability of "just predict the next token" proved unbeatable.

**Post-training matters as much as pre-training.** Every lab invests heavily in instruction tuning, RLHF or its variants, and safety training. The base model is increasingly just a starting point.

**Data quality trumps quantity past a certain point.** Every lab now invests enormous resources in data curation, deduplication, filtering, and quality scoring. The "just scrape the whole internet" era is over.

But the divergences are equally revealing:

**Open vs. closed.** Meta and Mistral bet on open weights. OpenAI and Anthropic kept models proprietary. Google hedged with Gemma (smaller open models) while keeping Gemini closed. The market hasn't decisively chosen.

**Native multimodal vs. bolt-on.** Google went all-in on native multimodal from training. Others added vision and audio capabilities through adapters and projection layers. The native approach produces more elegant cross-modal reasoning but requires fundamentally different training infrastructure.

**Safety philosophy.** Anthropic centers Constitutional AI and deliberate character training. OpenAI applies RLHF and behavioral guidelines. Meta releases weights and lets the community decide. These aren't just product decisions — they're genuine philosophical disagreements about who should control powerful AI systems.

**Model size strategy.** OpenAI went with massive MoE. Anthropic's exact architecture is undisclosed. Meta released a range of sizes. Mistral focused on efficient medium-sized models. There's no consensus on optimal architecture at the frontier.

## The Surprising Lesson

Here's what nobody expected in 2022: **the gap between labs would narrow so dramatically.** When GPT-4 launched, it seemed like OpenAI had an insurmountable lead. Twelve months later, four organizations had models within striking distance. Twenty-four months later, an open-weight model (LLaMA 3.1 405B) could match it.

This suggests something profound about the current paradigm. The transformer architecture plus massive pre-training plus alignment fine-tuning is a *recipe*, not a secret. Once the recipe is known, execution matters — but execution is a much thinner moat than invention. The labs that pull ahead in 2025-2026 will likely do so not because they found a better recipe for transformers, but because they found something beyond transformers — or found a way to make the existing recipe work on fundamentally different problems.

The commoditization of baseline capabilities is pushing competition to the edges: who has the best coding ability? The best agentic behavior? The best long-context reasoning? The best efficiency at a given price point? The most trustworthy safety profile? The answers to these questions differ depending on which lab you ask — and that's exactly how a healthy technology ecosystem is supposed to work.

---

*Tomorrow, we dive into one of the most elegant architectural tricks in modern AI: Mixture of Experts. How do you build a model with a trillion parameters but only use a fraction of them for each token? It's the technique behind GPT-4, Mixtral, and Gemini — and it's the reason the next generation of models will be simultaneously larger and cheaper to run.*

---

<div style="margin-top: 2em; padding: 1.5em; border-radius: 8px;">

## 📝 Quiz: Day 16

Test your understanding of how different labs diverged from the GPT approach:

<a href="quizzes/day-16.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 16 Quiz →</a>

</div>
