# Day 15: The GPT Series — The Scaling Bet That Paid Off

*How a small team's conviction that "just make it bigger" would work turned a modest 117-million-parameter experiment into a trillion-parameter empire — and reshaped the entire technology industry along the way.*

---

In June 2018, a researcher named Alec Radford at a small San Francisco nonprofit called OpenAI published a paper with one of the least exciting titles in AI history: "Improving Language Understanding by Generative Pre-Training." The paper described a model with 117 million parameters — roughly the memory footprint of a smartphone photo — trained on a single dataset of about 7,000 unpublished books called BooksCorpus. It used 12 transformer layers, 768-dimensional embeddings, and 12 attention heads. The entire thing could be trained on 8 GPUs in about a month.

Nobody outside a small circle of NLP researchers paid much attention.

Seven years and several hundred billion dollars later, that model's descendants power the most widely used AI products on the planet. The lineage from GPT-1 through GPT-4 and beyond represents perhaps the most successful scaling bet in the history of technology — a sustained, high-stakes wager that a single architectural idea, applied with exponentially more compute and data, would continue producing qualitatively new capabilities that nobody could have predicted from the previous generation.

This is the story of how that bet unfolded, what each generation changed, what it cost, and what it revealed about the strange relationship between scale and intelligence.

## GPT-1: The Proof of Concept (June 2018)

GPT-1 was, in retrospect, a beautifully simple idea. By mid-2018, the NLP community was drowning in task-specific models: one architecture for sentiment analysis, another for question answering, a third for textual entailment. Each task required its own labeled dataset, its own training pipeline, its own bag of tricks. Radford and co-authors Karthik Narasimhan, Tim Salimans, and Ilya Sutskever proposed something different: what if you trained a single generative model on a mountain of unlabeled text, then fine-tuned it with a thin task-specific layer for each downstream task?

The model itself was a decoder-only transformer — 12 layers, a context window of 512 tokens, trained with a simple next-token prediction objective on BooksCorpus's roughly 800 million words. The fine-tuning stage was almost comically minimal: slap a linear layer on top, train on a few thousand labeled examples, done.

The results were solid but not earth-shattering. GPT-1 achieved state-of-the-art performance on 9 out of 12 benchmarks, including commonsense reasoning (Stories Cloze Test: 86.5% accuracy) and question answering. But the real insight wasn't the numbers — it was the proof that unsupervised pre-training on raw text could transfer effectively to supervised tasks. BERT, published by Google just four months later in October 2018, would take a different architectural approach (bidirectional, encoder-only) and temporarily steal GPT-1's thunder. But Radford's decoder-only, autoregressive approach would ultimately prove more scalable — a fact that would take another two years to become obvious.

The key philosophical difference: BERT was designed to understand text. GPT was designed to generate it. Understanding is useful for classification tasks. Generation turns out to be useful for *everything*.

## GPT-2: "Too Dangerous to Release" (February 2019)

GPT-2 took the GPT-1 recipe and scaled it by roughly 13×. Parameters jumped from 117 million to **1.5 billion**. Training data expanded from BooksCorpus to **WebText**, a new dataset of about 8 million web pages (roughly 40 GB of text) scraped by following outbound links from Reddit posts with at least 3 karma — a clever heuristic for finding human-curated quality content.

The architectural changes were modest: 48 layers instead of 12, context window extended from 512 to 1,024 tokens, vocabulary expanded from roughly 40,000 to 50,257 BPE tokens. Layer normalization moved to the input of each sub-block (pre-norm), and an additional layer normalization was added after the final self-attention block. These are the kind of engineering tweaks that read as boring in a paper but matter enormously at scale — pre-norm, in particular, proved critical for training stability as models got deeper.

But GPT-2's significance wasn't architectural. It was about what the model could *do*.

OpenAI demonstrated that GPT-2 could generate remarkably coherent paragraphs of text. Given a prompt about the discovery of unicorns in the Andes mountains, the model produced several paragraphs of plausible-sounding (if fictional) news journalism, complete with invented quotes from scientists. The samples were good enough to fool casual readers — and bad enough to alarm the nascent AI safety community.

In what became one of the most controversial decisions in AI history, OpenAI initially released only the smallest version (117M parameters) and withheld the full 1.5B model, citing concerns about potential misuse for generating misinformation. The decision was widely ridiculed — critics pointed out that the model wasn't actually that good at generating convincing disinformation, and that the "staged release" strategy looked more like a publicity stunt than a genuine safety measure. Aaron Gokaslan and Vanya Cohen independently replicated the full model within months using publicly available data, undermining the notion that withholding weights could prevent misuse.

OpenAI eventually released the full model in November 2019, noting they had "seen no strong evidence of misuse so far." The episode established a pattern that would repeat at increasing stakes with each generation: release model, provoke debate about safety, release anyway.

What GPT-2 genuinely proved, beyond the controversy, was the zero-shot transfer hypothesis. Without any task-specific fine-tuning, the 1.5B model achieved 55 F1 on the CoQA reading comprehension benchmark — matching or exceeding several supervised baselines. It solved 7 out of 8 tested language tasks in zero-shot settings, simply by framing each task as text completion. The implication was profound: **sufficiently large language models don't need to be told what task they're performing. They can infer it from context.**

## GPT-3: The In-Context Learning Revolution (June 2020)

And then the scaling got serious.

GPT-3 didn't just scale up. It leapt. Parameters went from 1.5 billion to **175 billion** — a 117× increase. The model used 96 transformer layers, 12,288-dimensional embeddings, and 96 attention heads. The context window doubled to 2,048 tokens. Training data expanded to a blend of Common Crawl (filtered, 410 billion tokens), WebText2 (an expanded version of GPT-2's data, 19 billion tokens), two internet-based books corpora (67 billion tokens), and English Wikipedia (3 billion tokens) — roughly **300 billion tokens** total, though the model saw roughly 300B tokens during training with varying sampling weights across datasets.

The training compute was estimated at **3,640 petaflop/s-days** — equivalent to running a petaflop machine continuously for 3,640 days, or about 10 years. In practice, OpenAI used a cluster of NVIDIA V100 GPUs, and the training cost has been estimated at **$4.6 million** in compute alone, with total development costs including experimentation likely reaching $10–30 million.

GPT-3's landmark contribution was the discovery (or rather, the formalization) of **in-context learning**, which we covered in Day 13. But from a scaling perspective, the critical insight was captured in Figure 1.2 of the paper: a set of smooth power-law curves showing that larger models consistently performed better on essentially every benchmark, with no sign of plateauing. Performance on SuperGLUE improved from 42.3 (125M parameters) to 71.8 (175B parameters). Few-shot accuracy on TriviaQA hit 71.2%, surpassing the then-state-of-the-art fine-tuned model at 68.0%.

More importantly, GPT-3 exhibited capabilities that simply didn't exist in GPT-2. It could write functional code. It could perform 3-digit arithmetic (though it failed at 4-digit). It could translate between languages it had barely seen. It could generate creative fiction that, while not great literature, was clearly structured and coherent over multiple paragraphs. None of these abilities were explicitly trained — they emerged from the interaction of scale and data.

The paper, authored by Tom Brown and 30 co-authors, became one of the most cited machine learning papers ever published. Its title — "Language Models are Few-Shot Learners" — made a claim that seemed audacious at the time and obvious in retrospect.

GPT-3 also introduced the **API business model**. Rather than releasing the model openly, OpenAI offered access through an API, initially in private beta. This was a pivotal strategic shift: OpenAI was becoming a company that sold AI capabilities as a service. The decision was both commercially smart (GPT-3 would eventually generate hundreds of millions in API revenue) and philosophically significant — OpenAI, founded in 2015 as a nonprofit dedicated to ensuring AI "benefits all of humanity," was now a for-profit entity controlling access to its most powerful model.

## GPT-3.5 and ChatGPT: The Product Breakthrough (November 2022)

The period between GPT-3 (June 2020) and GPT-4 (March 2023) is often glossed over, but it contains one of the most important developments in AI history: the discovery that **alignment makes models useful**.

OpenAI published the InstructGPT paper in March 2022, showing that fine-tuning GPT-3 with reinforcement learning from human feedback (RLHF) — the technique we covered in Day 11 — dramatically improved the model's ability to follow instructions and produce helpful responses. The resulting model, with only **1.3 billion parameters**, was preferred by human labelers over the base 175B GPT-3 model 85% of the time. Read that again: a model 135× smaller, when properly aligned, was judged better by humans than the raw giant.

This insight — that alignment is a multiplier on capability, not just a safety feature — led directly to ChatGPT.

ChatGPT, launched on November 30, 2022, was built on GPT-3.5 — an intermediate model that OpenAI never formally published a paper about, but which appears to have been a GPT-3-class model further trained on code data (likely the Codex training pipeline) and then fine-tuned with RLHF. The model wasn't substantially more capable than GPT-3 on benchmarks. But it was **dramatically more usable**. It could hold coherent conversations. It followed instructions consistently. It admitted uncertainty (sometimes). It felt, for the first time, like talking to something that understood you.

ChatGPT reached 100 million monthly active users within two months — the fastest-growing consumer application in history at the time. It single-handedly transformed public perception of AI, triggered a multi-hundred-billion-dollar wave of corporate investment, and scared Google badly enough to declare a "code red" and rush out their own chatbot (Bard, later renamed Gemini) within weeks.

The lesson of ChatGPT wasn't about architecture or scale. It was about **product-market fit**: the right interface (conversation), the right alignment technique (RLHF), and good-enough capabilities, delivered at the right moment.

## GPT-4: The Mixture of Experts Gambit (March 2023)

GPT-4 is where OpenAI stopped publishing details.

The GPT-4 technical report, released in March 2023, is one of the most frustrating documents in the history of scientific publishing. It's 98 pages long and contains essentially no information about the model's architecture, parameter count, training data, or training cost. OpenAI explicitly stated they would not disclose these details, citing "the competitive landscape and the safety implications."

What we know comes largely from leaks and reverse engineering, particularly a July 2023 report by SemiAnalysis that has been broadly corroborated. According to these reports, GPT-4 uses a **Mixture of Experts (MoE) architecture** — the first confirmed use of MoE at this scale in the GPT lineage. The model reportedly contains approximately **1.8 trillion total parameters** spread across **120 transformer layers**, with **16 expert modules** of roughly **111 billion parameters each**. During any given forward pass, only **2 experts** are activated per token, meaning the model's effective compute per token is roughly equivalent to a 220-billion-parameter dense model — not 1.8 trillion.

This is the engineering insight that made GPT-4 economically feasible. A dense 1.8T model would be essentially impossible to serve at consumer scale — you'd need roughly 3,700 TFLOP per inference pass, requiring hardware that doesn't exist in commercially viable configurations. But with MoE routing only 2 of 16 experts per token, inference costs drop by roughly 8× compared to a dense model of the same total parameter count, while the model retains the *knowledge capacity* of the full 1.8T parameters (since different experts specialize in different domains).

Training reportedly took place on a cluster of approximately **25,000 NVIDIA A100 GPUs** over roughly 90-100 days, using about **13 trillion tokens** of training data — a mix of CommonCrawl, RefinedWeb, curated internet text, books, and code. The compute cost is estimated at roughly **$100 million** for the final training run alone, with total development costs (including experimentation, failed runs, and smaller model training) likely several times higher.

The capability jump was unmistakable. GPT-4 passed the Uniform Bar Exam in the **90th percentile** (GPT-3.5 scored around the 10th percentile). It scored a **5 on AP Biology, AP Calculus BC, and AP Chemistry**. On the LSAT, it placed in the **88th percentile**. On competitive programming problems (Codeforces), it moved from the 5th percentile (GPT-3.5) to the 49th percentile. It could reason about images — a first for the GPT lineage — describing charts, reading text in photos, and explaining visual humor.

Here's the counterintuitive fact buried in these numbers: **GPT-4 uses roughly the same amount of compute per token at inference as GPT-3 did**, despite being vastly more capable. The MoE architecture means that most of the 1.8 trillion parameters sit idle for any given token, activated only when the routing network determines they're relevant. The model got dramatically smarter without getting proportionally more expensive to run. This is the engineering magic of Mixture of Experts — you get the knowledge capacity of a giant, with the speed of a model a fraction its size.

## Beyond GPT-4: The Post-Number Era (2024–2026)

After GPT-4, OpenAI's naming scheme fractured in a way that reflects a deeper strategic shift.

**GPT-4 Turbo** (November 2023) extended the context window from 8,192 to **128,000 tokens** — a 16× increase — while reducing API pricing by 3×. This was an engineering achievement as much as a research one: fitting 128K tokens into the KV cache at reasonable cost required significant attention optimization (likely including grouped-query attention and other techniques we'll cover in Day 19).

**GPT-4o** (May 2024) introduced native multimodality — a single model handling text, images, and audio natively, rather than stitching together separate models. The "o" stands for "omni." It was also significantly faster and cheaper than GPT-4 Turbo, suggesting an optimized architecture or aggressive distillation.

Then came the **o-series**: o1 (September 2024) and o3 (December 2024). These represent a fundamentally different approach. Rather than scaling pre-training (more parameters, more data), the o-series scales **inference-time compute** — the model "thinks" longer on hard problems by generating internal reasoning chains before producing an answer. OpenAI calls this "test-time compute scaling." On the ARC-AGI benchmark, o3 achieved **87.5%** accuracy, a massive jump from GPT-4's performance. On competitive mathematics (AIME 2024), o1 scored comparably to gold-medalist humans.

This shift — from scaling training to scaling inference — may represent the most significant strategic pivot in the GPT lineage. We'll explore it in depth on Day 28, but the key insight is: there might be two different axes of scaling, and OpenAI appears to be betting that inference-time scaling has more room to run.

## The Meta-Story: What the GPT Series Actually Proved

Zoom out from the individual models and the GPT series tells a single, remarkable story: **more compute, applied to the same basic architecture, consistently produces qualitatively new capabilities.**

| Model | Year | Parameters | Training Data | Estimated Cost | Key Capability |
|-------|------|-----------|---------------|----------------|----------------|
| GPT-1 | 2018 | 117M | ~800M words | ~$10K | Transfer learning |
| GPT-2 | 2019 | 1.5B | ~40GB (8M pages) | ~$50K | Coherent text generation |
| GPT-3 | 2020 | 175B | ~300B tokens | ~$4.6M | In-context learning |
| GPT-4 | 2023 | ~1.8T (MoE) | ~13T tokens | ~$100M | Expert-level reasoning |

Each generation costs roughly 20–100× more than the last. Each produces capabilities that would have seemed implausible to the previous generation's researchers. GPT-1's team could not have predicted few-shot learning. GPT-3's team could not have predicted bar exam performance. The returns to scale haven't just been quantitative — they've been qualitative.

But the most important lesson might be what *didn't* change. Every model in the GPT lineage uses the same fundamental operation: predicting the next token. The same attention mechanism. The same basic transformer block. The architecture of GPT-4, despite being a Mixture of Experts, is recognizably a descendant of GPT-1. The innovations have been primarily about scale (more parameters, more data, more compute), training methodology (RLHF, constitutional AI, instruction tuning), and engineering (MoE routing, longer contexts, inference optimization) — not about fundamental architectural breakthroughs.

This is either profoundly encouraging or deeply unsettling, depending on your perspective. Encouraging because it means we may not need fundamentally new ideas to make further progress — just more resources. Unsettling because it raises the question of whether we've been exploring one narrow branch of the design space, and whether radically different approaches might be more efficient.

It also raises a question that haunts every AI lab: **is the scaling curve bending?** GPT-4 to GPT-4o showed significant efficiency improvements but arguably modest capability gains. The pivot to inference-time scaling with the o-series might be an acknowledgment that pure pre-training scaling is hitting diminishing returns — or it might simply be an additional dimension of scaling that supplements rather than replaces the original approach.

---

*Tomorrow, we step outside the OpenAI bubble entirely. Claude, Gemini, Llama — how did other labs respond to the GPT juggernaut? Some copied the playbook. Some diverged radically. The choices they made reveal what's actually essential about the GPT approach versus what was just one lab's particular set of bets.*

---

<div style="margin-top: 2em; padding: 1.5em; border-radius: 8px;">

## 📝 Quiz: Day 15

Test your understanding of the GPT series evolution:

<a href="quizzes/day-15.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 15 Quiz →</a>

</div>
