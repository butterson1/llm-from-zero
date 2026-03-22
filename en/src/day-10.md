# Day 10: Fine-Tuning & Transfer Learning — Adapting a Foundation Model

*Yesterday you watched the sausage being made: trillions of tokens scraped, filtered, deduplicated, and fed into transformers at enormous cost. The result is a foundation model — a giant statistical mirror of human text. But here is the thing: that mirror reflects everything, which means it reflects nothing in particular. Ask a raw pretrained model to answer a medical question and it might continue writing a Wikipedia article, or generate a Reddit thread, or hallucinate a citation, or produce a poem. It has knowledge. It lacks direction. Today we explore how the field learned to steer these beasts — cheaply, quickly, and with startling effectiveness — through fine-tuning and transfer learning.*

---

## The Insight That Changed Everything: Features Transfer

Before we talk about LLMs, we need to go back to 2014 and a PhD student named Jason Yosinski at Cornell. Yosinski ran an experiment with convolutional neural networks trained on ImageNet. He split a network in half and asked: if you freeze the bottom layers and retrain only the top, how much does performance degrade? The answer was remarkable. **The early layers learned almost universal features** — edge detectors, color blobs, texture patterns — that transferred across wildly different tasks. The later layers specialized. You could take a network trained on photographs of dogs and repurpose it for satellite imagery by swapping out just the final layers.

This was transfer learning: the realization that representations learned on one task carry over to others. In computer vision, it became standard practice almost overnight. Instead of training from scratch, you fine-tuned a pretrained model. Training costs dropped by 10–100×. Datasets that were too small for learning from scratch suddenly worked, because the model already knew how to see.

But language resisted this treatment for years. Word2Vec (Day 2) transferred *embeddings*, but the models built on top still needed task-specific training. LSTMs could be pretrained, but the gains were modest. The breakthrough came in 2018, when three papers — **ULMFiT** from Jeremy Howard and Sebastian Ruder, **ELMo** from the Allen Institute, and **BERT** from Google — proved that language models could be pretrained on raw text and then fine-tuned on specific tasks with as few as a thousand labeled examples. Howard and Ruder, in particular, proposed a careful recipe: gradual unfreezing of layers, discriminative learning rates (lower for early layers, higher for later ones), and a specific learning rate schedule. These tricks mattered because language models are deeper and more brittle than vision models. Blast the entire network with a high learning rate and the pretrained knowledge evaporates — a phenomenon researchers call **catastrophic forgetting**.

The field went from "you need 100,000 labeled examples per task" to "you need 1,000 examples and a pretrained model." That is an efficiency gain so enormous it reshaped the entire NLP industry in under two years.

## What Fine-Tuning Actually Does to the Weights

A pretrained language model like Llama 3.1 70B has 70 billion parameters organized across layers of attention heads and feed-forward networks. During pretraining, those parameters encode a compressed representation of language: syntax, facts, reasoning patterns, tone, style, and a lot of internet noise. When you fine-tune, you take this entire checkpoint and continue training on a much smaller, much more targeted dataset with a much lower learning rate.

Think of it this way. Pretraining builds the terrain: mountains of grammar, valleys of common sense, rivers of factual associations. Fine-tuning does not bulldoze the terrain. It lays roads. The mountain range stays. The rivers stay. But now there are paths that guide the model's behavior toward specific destinations — answering questions, following instructions, writing code in a particular style.

Mechanistically, fine-tuning makes small adjustments to many parameters simultaneously. Research from 2023 by a team at Anthropic (including Chris Olah) showed that fine-tuning on instruction data primarily modifies the attention heads' output projections and the later feed-forward layers — the parts of the network closest to the output. The early layers, which encode lower-level linguistic features, barely change. This echoes Yosinski's 2014 result in vision: **the shallow layers are universal; the deep layers specialize.**

The practical consequence: fine-tuning is cheap. Where pretraining Llama 3.1 405B cost Meta an estimated **30.84 million GPU-hours** on H100s, fine-tuning that same model on a few hundred thousand instruction examples might take **a few hundred GPU-hours** — roughly 0.001% of the pretraining budget. You can fine-tune a 7B model on a single A100 in an afternoon.

## Supervised Fine-Tuning: The Instruction Revolution

The earliest and most consequential form of fine-tuning for modern LLMs is **supervised fine-tuning (SFT)**, sometimes called **instruction tuning**. The idea: collect a dataset of (prompt, desired response) pairs and train the model to produce the response given the prompt. The loss function is the same next-token prediction loss from pretraining — nothing changes architecturally — but the data changes radically.

The seminal work was **FLAN** (Fine-tuned Language Net) from Google in 2021, led by Jason Wei and colleagues. They took a 137B-parameter LaMDA model and fine-tuned it on **62 NLP datasets** phrased as natural language instructions: "Translate the following sentence to French," "Is this movie review positive or negative?", "Summarize this article." The fine-tuned model outperformed the raw pretrained model on **unseen tasks** — tasks it had never been fine-tuned on. This was the key surprise: instruction tuning didn't just teach the model to solve those 62 specific tasks. It taught the model the *meta-skill* of following instructions.

OpenAI took this further with **InstructGPT** in early 2022. They hired 40 human labelers to write tens of thousands of prompt-response pairs covering the kinds of queries real users would send. A 1.3B InstructGPT model — fine-tuned on this data — was preferred by human evaluators over the raw 175B GPT-3. Read that again: **a model 135× smaller beat the giant by learning to follow directions.** This was the moment the industry realized that the pretrained model is the engine, but fine-tuning is the steering wheel.

Today, every frontier model goes through SFT. Claude, GPT-4, Gemini, Llama — all are instruction-tuned before release. The datasets vary. Anthropic uses internally generated conversations rated by researchers. Meta's Llama 3.1 paper describes using **27.4 million SFT examples** across categories like coding, math, reasoning, safety, and multilingual dialogue. The mix matters enormously: too much code fine-tuning makes the model terse and literal in conversation; too much conversational data makes it chatty when you want precise answers.

## The LoRA Revolution: Fine-Tuning With 0.01% of the Parameters

Full fine-tuning updates every parameter in the model. For a 70B model in 16-bit precision, that means holding two copies in memory — the parameters and their gradients — plus optimizer states, totaling roughly **560 GB of VRAM**. Even on a cluster of 8× A100-80GB GPUs, this is tight. For a 405B model, it is a serious infrastructure project.

Enter **LoRA** — Low-Rank Adaptation — introduced by Edward Hu and colleagues at Microsoft in 2021. The core insight is beautifully simple. When you fine-tune a large model, the weight updates are **low-rank**: they occupy a tiny subspace of the full parameter space. So instead of updating a weight matrix W directly, LoRA freezes W and adds a small detour: W + BA, where B and A are skinny matrices with rank r (typically 8–64). For a weight matrix of size 4096×4096 (about 16.7 million parameters), a rank-16 LoRA adds only 2 × 4096 × 16 = **131,072 trainable parameters** — less than 1% of the original.

The results were shocking. LoRA fine-tuning matched full fine-tuning performance on nearly every benchmark while training **only 0.01–0.1% of the model's parameters**. Memory requirements dropped by 3–10×. Training time dropped proportionally. Suddenly, fine-tuning a 65B model was feasible on a single GPU node.

LoRA spawned a family of variants. **QLoRA** (2023, from Tim Dettmers at the University of Washington) combined LoRA with 4-bit quantization of the frozen base weights, enabling fine-tuning of a 65B model on a **single 48GB GPU**. The memory footprint dropped to about 33 GB. This democratized fine-tuning: anyone with a rented A100 or even a high-end consumer GPU could adapt a frontier-scale model. **DoRA** (Weight-Decomposed Low-Rank Adaptation, 2024) separates the magnitude and direction of weight updates and often outperforms vanilla LoRA. **LoRA+** adjusts the learning rates of A and B separately, improving convergence speed by 2×.

The adapter paradigm also means you can stack specializations. Want a model that is great at legal analysis AND medical Q&A? Train two separate LoRA adapters and swap them at inference time. The base model stays frozen. Each adapter is a few hundred megabytes — a rounding error compared to the 140 GB base model file.

## The Full Spectrum: From Prompt Tuning to Full Fine-Tuning

Fine-tuning exists on a spectrum of how many parameters you touch:

**Prompt tuning and prefix tuning** (2021, Google and Stanford) add a handful of learnable "soft tokens" to the input — typically 10–100 virtual tokens whose embeddings are trained while the entire model stays frozen. These are not real words; they are learned vectors that steer the model. With only ~20,000 trainable parameters, prompt tuning can match fine-tuning on some tasks. But it struggles with complex instruction-following and is mostly used in specialized enterprise deployments.

**Adapters** insert small trainable bottleneck layers between frozen transformer blocks. Introduced by Houlsby et al. at Google in 2019, adapters add about 3–5% extra parameters. They were popular before LoRA but have been largely superseded.

**LoRA and variants** modify the weight matrices themselves via low-rank decompositions, as described above. This is the current sweet spot for most practitioners.

**Full fine-tuning** updates everything. Still used by frontier labs (OpenAI, Anthropic, Google, Meta) because when you have the compute, it squeezes out the last few percent of quality. But the cost-performance ratio of LoRA means full fine-tuning is increasingly reserved for the largest-budget projects.

Here is the surprising fact that ties this together: **a rank-16 LoRA adapter for a 70B model contains about 100 million parameters — roughly the size of the original BERT model.** The entire specialization of a model 700× larger fits in a package the size of a 2018-era language model. That is how low-dimensional the "skill" subspace really is.

## What Fine-Tuning Can and Cannot Do

Fine-tuning is powerful, but it has real limits. Understanding them separates practitioners from cargo-cult prompt engineers.

**What fine-tuning excels at:**
- **Format and style.** Teaching a model to respond in JSON, follow a specific template, adopt a persona, or match a brand voice. This is the lowest-hanging fruit.
- **Instruction following.** The SFT step that turns a raw language model into an assistant.
- **Domain specialization.** Medical models like Med-PaLM 2 (Google, 2023) fine-tuned PaLM 2 on medical Q&A and achieved 86.5% on the U.S. Medical Licensing Exam — expert-level performance. Bloomberg trained BloombergGPT on financial text; StarCoder was fine-tuned on code.
- **Behavioral alignment.** SFT is the first step of the RLHF pipeline (Day 11), teaching the model what a good response looks like.

**What fine-tuning struggles with:**
- **Adding entirely new knowledge.** If the base model has never seen anything about a proprietary internal system, fine-tuning on a few thousand examples will not reliably teach it that system's details. The model may appear to learn the facts but will hallucinate freely when probed outside the training distribution. RAG (Day 22) is usually better for injecting specific knowledge.
- **Removing deeply encoded biases.** Fine-tuning can suppress certain outputs but doesn't erase the underlying representations. The biases from pretraining data (Day 9) are compressed into the parameter geometry; a thin LoRA adapter overlays new behavior without deleting old patterns.
- **Overriding strong priors.** If the model learned from millions of examples that "the capital of Australia is Sydney" (a common web misconception), a few hundred fine-tuning examples saying "Canberra" may not be enough. The pretraining prior is enormous.

A useful mental model: fine-tuning adjusts the **probability distribution over outputs**, amplifying some behaviors and suppressing others. It is a gentle reweighting, not a rewrite. The pretrained model remains the substrate; fine-tuning adds a coating.

## The Dark Arts: Overfitting, Data Quality, and the Alignment Tax

Fine-tuning on small datasets carries a real risk: **overfitting**. A model fine-tuned on 500 examples for 10 epochs might perfectly reproduce those 500 examples but lose its general capabilities. Researchers call this the **alignment tax** — the performance you sacrifice on general benchmarks to gain task-specific behavior. The InstructGPT paper reported modest drops on some academic NLP benchmarks after RLHF, and early ChatGPT was noticeably worse than base GPT-3.5 at certain pure language modeling tasks.

Data quality dominates data quantity in fine-tuning even more than in pretraining. A landmark 2023 paper from Microsoft and Peking University, "LIMA: Less Is More for Alignment," fine-tuned Llama 65B on just **1,000 carefully curated examples** and produced a model that human evaluators preferred over GPT-3.5 (DaVinci003) 43% of the time. One thousand examples. The entire alignment dataset fit in a single spreadsheet. The catch: those 1,000 examples were hand-picked by researchers from Stack Exchange, wikiHow, and Reddit — high-quality, diverse, and stylistically consistent. LIMA proved that for SFT, **a few great examples beat millions of mediocre ones.**

This has practical implications. Companies fine-tuning models for customer support or legal analysis often obsess over dataset size when they should obsess over dataset *quality*. Ten carefully written, representative examples of the ideal response format can outperform 10,000 auto-generated ones. The field has learned, sometimes painfully, that garbage in, garbage out applies with double force in fine-tuning.

## The Ecosystem Today

Fine-tuning has become an industry. Hugging Face hosts over **800,000 model checkpoints**, many of which are community fine-tunes of Llama, Mistral, or Qwen base models. Platforms like Together AI, Anyscale, and Lambda Labs offer fine-tuning-as-a-service. OpenAI offers a fine-tuning API where you upload a JSONL file of examples and get back a customized GPT-4o-mini for about **$3 per million training tokens** — meaning you can fine-tune on 100,000 examples for under $25.

The open-source community has gone further. Projects like **Axolotl**, **LLaMA-Factory**, and Hugging Face's **TRL** (Transformer Reinforcement Learning) library provide turnkey fine-tuning pipelines. You can LoRA-fine-tune a Llama 3 8B model on a single RTX 4090 (24GB VRAM) in about 2 hours on 50,000 examples. The gap between "frontier lab capability" and "person with a credit card" has never been narrower for fine-tuning.

This accessibility has created an explosion of specialized models. **Nous-Hermes**, **OpenHermes**, **WizardLM**, **Orca** — these are fine-tunes of open base models that sometimes rival much larger proprietary systems. WizardLM 70B achieved 86% on HumanEval (code generation) through a clever fine-tuning technique called Evol-Instruct, which used GPT-4 to iteratively rewrite and increase the complexity of training prompts.

## Where This Is Heading

The line between pretraining and fine-tuning is blurring. Meta's Llama 3.1 paper describes a process where SFT data quality is iteratively improved using the model itself — the model generates responses, humans rate them, and the best responses become training data for the next round. This "self-improvement" loop is one of the most active research areas in the field.

Meanwhile, the efficiency techniques keep advancing. **NEFTune** (adding noise to embeddings during fine-tuning) improves chat quality. **ORPO** (Odds Ratio Preference Optimization) combines SFT and preference learning in a single step. Researchers at Stanford and Berkeley are exploring **continual fine-tuning** — adapting models to new knowledge without forgetting old capabilities, solving the catastrophic forgetting problem that has plagued neural networks since the 1990s.

---

*Tomorrow, we cross from supervised fine-tuning into territory that changed the game even more dramatically. If SFT teaches a model what a good response looks like, **RLHF — Reinforcement Learning from Human Feedback** — teaches it to prefer good responses over bad ones. It is the technique that turned GPT-3.5 into ChatGPT, the secret sauce behind Claude's personality, and one of the most controversial training methods in modern AI. We will break down reward models, PPO, DPO, and the philosophical puzzle of teaching machines human values.*

---

<div style="text-align: center; margin: 2em 0;">
<h2>📝 Day 10 Quiz</h2>

<a href="quizzes/day-10.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Take the Day 10 Quiz →</a>

</div>
