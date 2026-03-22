# Day 20: Small Models That Punch Above Their Weight — Distillation, Pruning, and LoRA

*How the AI world learned that brains beat brawn — and why the most important models of 2025 might not be the biggest ones.*

---

## The Paradox of Shrinking Intelligence

Here's a counterintuitive claim: the most consequential advance in AI over the past two years isn't a larger model. It's a smaller one.

In January 2025, DeepSeek released R1-Distill-Qwen-1.5B — a model with 1.5 billion parameters that, on certain mathematical reasoning benchmarks, outperformed GPT-4o. Read that again. A model roughly 1,000 times smaller than GPT-4's estimated 1.8 trillion parameters, running on a smartphone-class chip, matching or beating a flagship model that cost over $100 million to train. The trick? It was *distilled* — its knowledge was compressed from a much larger teacher model, like squeezing a library into a pocket notebook by keeping only the most important ideas.

This isn't an isolated curiosity. Microsoft's Phi-4-mini, at 3.8 billion parameters, rivals models five times its size on coding and math tasks. Google's Gemma 2 2B matches performance that required 13B parameters just eighteen months earlier. Meta pruned Llama 3.1 8B down to a 4B model that outperforms most models trained from scratch at that size. The era of "bigger is always better" is giving way to something more nuanced: *efficient is the new big*.

Three techniques power this revolution: **knowledge distillation** (teaching small models to mimic large ones), **pruning** (surgically removing unnecessary weights), and **LoRA** (adding tiny trainable patches to frozen giants). Together, they're reshaping who can build, deploy, and run AI — and they're the reason you'll eventually have a genuinely intelligent model running entirely on your phone.

## Knowledge Distillation: The Teacher-Student Protocol

The concept of knowledge distillation dates to Geoffrey Hinton, Oriol Vinyals, and Jeff Dean's 2015 paper "Distilling the Knowledge in a Neural Network." The core insight is deceptively simple: a large trained model knows more than its final answers reveal.

When a language model predicts the next token, it doesn't just output one answer — it produces a probability distribution over its entire vocabulary. If the correct next word is "cat," a well-trained model might assign 72% probability to "cat," 8% to "kitten," 5% to "dog," 3% to "feline," and tiny probabilities to everything else. Those non-answer probabilities — the "soft labels" — contain a rich map of conceptual relationships. The fact that "kitten" gets 8% while "refrigerator" gets 0.001% encodes genuine knowledge about semantic similarity.

A student model trained on these soft probability distributions rather than hard one-hot labels (where "cat" = 1 and everything else = 0) learns far more per training example. It's the difference between a teacher who says "the answer is Paris" and one who says "the answer is Paris, but Lyon was a reasonable guess given the question, and Brussels would make sense if you confused the country — London is way off though." The soft teacher gives the student a richer understanding of the problem landscape.

### The Temperature Trick

Hinton's key technical insight was **temperature scaling**. Neural networks typically sharpen their output distributions — after training, the model might put 99.5% on "cat" and negligible mass everywhere else, burying those informative inter-class relationships. By dividing the logits (pre-softmax scores) by a temperature parameter T > 1 before applying softmax, you "soften" the distribution, spreading probability mass more evenly and revealing the model's internal knowledge structure. In practice, temperatures of 2–4 work well: high enough to expose soft knowledge, low enough to keep the primary answer dominant.

The student is trained with a combined loss: one term matches the teacher's softened distribution (via KL divergence), and another matches the hard ground-truth labels. This dual objective gives the student both the teacher's structural knowledge and direct supervision from correct answers.

### From DistilBERT to DeepSeek-R1

The first blockbuster result was **DistilBERT** (2019, Hugging Face's Victor Sanh and collaborators). They distilled BERT-base's 110M parameters down to 66M — 40% smaller, 60% faster at inference, while retaining 97% of BERT's performance on the GLUE benchmark. The trick went beyond basic logit matching: DistilBERT also aligned its hidden-state representations with the teacher's intermediate layers, essentially ensuring the student's internal "thought process" resembled the teacher's, not just its final answers.

**TinyBERT** (2020, Huawei) pushed further, distilling both attention matrices and hidden states across all transformer layers. The result was a model 7.5x smaller and 9.4x faster than BERT-base, with 96.8% of its performance. This layer-by-layer approach — called "patient knowledge distillation" — is like an apprentice shadowing a master chef through every step of the recipe, not just tasting the final dish.

The approach has scaled dramatically for modern LLMs. **TinyLlama** (2024, Peiyuan Zhang and collaborators at Singapore's SUTD) trained a 1.1B parameter model on 3 trillion tokens — far more data than a model its size would normally see — using curriculum and data strategies inspired by Llama 2. While not pure distillation, it showed that small models with enormous training budgets can be surprisingly capable.

The real watershed was **DeepSeek-R1** in January 2025. DeepSeek trained a massive reasoning model using reinforcement learning, then distilled it into a family of smaller models: 70B, 32B, 14B, 8B, 7B, and a startling 1.5B version built on the Qwen2.5 architecture. The distillation wasn't just about matching logits — DeepSeek distilled the *reasoning chains* themselves, training the student to produce the same chain-of-thought sequences the teacher generated. The 1.5B model scored 28.9% on AIME 2024 (a competition math exam), compared to GPT-4o's 79.2% — but the 14B version hit 69.7%, competitive with models many times its size. The 32B distillation actually *outperformed* OpenAI's o1-mini on multiple benchmarks.

## Pruning: The Neuroscience of Artificial Brains

If distillation is teaching a new, smaller student, pruning is performing brain surgery on the original — removing neurons and connections that don't earn their keep. The biological analogy is real: human brains undergo massive synaptic pruning during childhood, eliminating roughly 50% of synapses between ages 2 and 16. The result isn't a dumber brain — it's a more efficient one. Unused connections are metabolic overhead; removing them frees resources for the pathways that matter.

### Structured vs. Unstructured Pruning

**Unstructured pruning** zeroes out individual weights wherever they're smallest. If a weight connecting neuron A to neuron B is 0.00003, it's probably not doing much — set it to zero. This can eliminate 80–90% of weights with minimal accuracy loss for many tasks. The problem? The resulting sparse matrices are *irregular* — you can't easily accelerate them on GPUs, which are designed for dense, regular computations. You save storage but not necessarily speed.

**Structured pruning** removes entire neurons, attention heads, or even whole transformer layers. This produces a genuinely smaller, dense model that runs faster on standard hardware. The trade-off is less surgical precision: removing an entire attention head kills both its useful and useless computations.

### The Lottery Ticket Hypothesis

In 2019, Jonathan Frankle and Michael Carlin at MIT published "The Lottery Ticket Hypothesis," one of the most provocative papers in deep learning. Their finding: within a large randomly initialized network, there exists a small subnetwork (a "winning ticket") that, if trained in isolation from the same initialization, achieves the same performance as the full network in the same number of training steps.

This implies that the majority of a neural network's parameters are *waste* — they exist only because we don't know in advance which subnetwork will be the winning ticket. We initialize millions of parameters and hope the right ones get trained. It's like buying millions of lottery tickets to guarantee a win, when you only needed one — if you knew which one.

The practical challenge is finding the winning ticket efficiently. The original method required training the full network, pruning, rewinding to initial weights, and retraining — an iterative process more expensive than training once. But the conceptual breakthrough was enormous: it proved that small models *can* match large ones, if only we knew how to find them directly.

### NVIDIA's Minitron: Pruning at Scale

In 2024, NVIDIA's Saurav Muralidharan and collaborators demonstrated state-of-the-art pruning at LLM scale with the **Minitron** approach. They took the Nemotron-4 15B model and produced an 8B version through a combination of width pruning (removing attention heads and FFN neurons) and depth pruning (removing entire transformer layers).

The key innovation was using *activation-based importance estimation* rather than weight magnitude. Instead of asking "how big is this weight?", they asked "how much does this neuron's activation actually vary across real data?" A neuron that always outputs roughly the same value, regardless of input, is doing nothing useful — it's a constant that could be folded into a bias term. After pruning, they retrained on only 94 billion tokens (a fraction of the original training data) using the teacher's soft labels. The resulting Minitron-8B outperformed many models trained from scratch at similar sizes.

Meta applied similar ideas to compress **Llama 3.1 8B into a 4B model**, using structured pruning to remove layers and heads followed by knowledge distillation to recover accuracy. The compressed Llama-3.1-Minitron-4B outperformed Phi-2 (2.7B), Gemma 2 (2.6B), and the original Minitron-4B across standard benchmarks — despite being a pruned derivative, not an architecture designed from scratch.

## LoRA: The Surgical Fine-Tuning Revolution

While distillation creates smaller models and pruning shrinks existing ones, **LoRA (Low-Rank Adaptation)** addresses a different problem: how do you customize a massive model for a specific task without retraining all its parameters?

Fine-tuning a 70B parameter model requires updating all 70 billion weights, storing optimizer states for each (2–3x the model size), and maintaining gradients in memory. A full fine-tune of Llama 2 70B needs roughly 1.2 TB of GPU memory — about 16 A100 80GB GPUs. For most organizations, this is prohibitively expensive.

Edward Hu and collaborators at Microsoft published LoRA in 2021 with an elegant mathematical insight. They observed that the weight updates during fine-tuning tend to be **low-rank** — that is, the change matrix ΔW can be well-approximated by the product of two much smaller matrices: ΔW ≈ BA, where B is d×r and A is r×d, with rank r << d.

### The Intuition

Imagine you have a 4096×4096 weight matrix — about 16.7 million parameters. Full fine-tuning updates all 16.7 million values. LoRA instead freezes the original matrix and adds two skinny matrices: a 4096×16 and a 16×4096 (using rank r=16). That's only 131,072 trainable parameters — less than 1% of the original. During inference, the LoRA matrices are multiplied together and added to the frozen weight: W' = W + BA. The result is mathematically equivalent to having fine-tuned the original weight, but the training cost is dramatically lower.

Why does this work? Because fine-tuning for a specific task doesn't require reconfiguring the entire model — it requires nudging it in a relatively low-dimensional direction. The model already knows English, knows facts, knows reasoning patterns. Teaching it to, say, respond in a particular format or focus on medical terminology requires changes that live in a much smaller subspace than the full parameter space. LoRA finds and operates in exactly that subspace.

### QLoRA: Democratizing Fine-Tuning

Tim Dettmers and collaborators at the University of Washington published **QLoRA** in 2023, combining LoRA with aggressive quantization. The frozen base model is quantized to 4 bits (using a novel "NormalFloat4" data type), while the small LoRA adapter matrices remain in 16-bit precision. This allows fine-tuning a 65B parameter model on a *single 48GB GPU* — a feat that would otherwise require a multi-GPU cluster.

QLoRA introduced two key innovations: **double quantization** (quantizing the quantization constants themselves, saving an additional 0.37 bits per parameter) and **paged optimizers** (using CPU memory as overflow when GPU memory fills up, managed through NVIDIA's unified memory). The result? Fine-tuning Llama 65B dropped from requiring ~780GB of GPU memory to ~48GB, with negligible quality loss. Their fine-tuned model, Guanaco, reached 99.3% of ChatGPT's performance on the Vicuna benchmark while being trainable on hardware costing under $10,000.

### DoRA, AdaLoRA, and the LoRA Zoo

The success of LoRA spawned an ecosystem of variants. **DoRA (Weight-Decomposed Low-Rank Adaptation)**, published in 2024 by Shih-Yang Liu and collaborators, decomposes weights into magnitude and direction components, applying LoRA only to the direction. This better mirrors full fine-tuning's update patterns and consistently outperforms standard LoRA, especially at low ranks.

**AdaLoRA** dynamically allocates rank across different layers — attention projection matrices that need more adaptation get higher rank, while layers that barely change get rank 1 or even 0. This is more parameter-efficient than uniform-rank LoRA, which wastes capacity on layers that don't need it.

**LoRA+** (2024, Zhu and collaborators) discovered that setting different learning rates for the A and B matrices — specifically making the B learning rate 2–8x larger than A's — significantly improves convergence speed and final performance, at zero additional cost.

The practical impact is staggering. On Hugging Face, there are now over **500,000 LoRA adapters** — tiny files, typically 10–100MB, that transform a base model for specific tasks. One base Llama model can serve thousands of different applications by swapping adapters in and out, like changing lenses on a camera body. Serving infrastructure like **S-LoRA** can host thousands of adapters simultaneously with minimal overhead, dynamically loading the right one per request.

## The Convergence: Combining Techniques

The real magic happens when these techniques combine. The modern recipe for a high-performance small model often looks like:

1. **Start big**: Train or obtain a large teacher model (e.g., Llama 3.1 405B)
2. **Prune**: Remove 40–60% of structure using activation-based importance
3. **Distill**: Retrain the pruned model using the teacher's soft labels
4. **Quantize**: Compress weights to 4-bit for deployment (Day 19's territory)
5. **LoRA-tune**: Add task-specific adapters for particular use cases

Microsoft's **Phi** series exemplifies another path: instead of compressing large models, train small models from scratch on *extremely high-quality data*. Phi-1 (1.3B) was trained on "textbook-quality" data — a curated, synthetically augmented dataset of code. Phi-2 (2.7B) matched or exceeded models 25x its size on reasoning benchmarks by being fanatically selective about training data. Phi-4-mini (3.8B) pushes this further with synthetic data generated by larger models — itself a form of distillation, where the teacher's knowledge is captured not in soft labels but in generated training examples.

The surprising upshot: **a well-trained 3B model today matches a poorly trained 70B model from 2023.** Model quality is not just about parameter count — it's about the interaction of architecture, training data quality, training duration, and compression technique. A 7B model trained on 15 trillion carefully curated tokens and distilled from a 400B teacher will outperform a 70B model trained on 2 trillion tokens of unfiltered web crawl.

## Why This Matters: The Democratization Argument

The economic implications are profound. Running GPT-4 costs roughly $0.01–0.03 per 1K tokens via API. Running a quantized 7B model locally costs *nothing per query* after the one-time hardware investment. A $200 used GPU (RTX 3060 12GB) can run a 7B model at 30+ tokens per second. A modern smartphone chip can handle a 3B model at usable speeds.

This creates an entirely different deployment model. Instead of every query flowing through centralized API servers (with associated latency, privacy concerns, and costs), small models enable **edge AI**: medical diagnosis in rural clinics without internet, legal document analysis without sending confidential data to the cloud, personal assistants that know your entire email history without any company having access to it.

The privacy implications alone could be transformative. A LoRA-adapted local model that has learned your writing style, your preferences, your medical history — but all running on your device, with your data never leaving your hardware — offers something that cloud AI fundamentally cannot: *genuine privacy with genuine personalization*.

## What's Next

Tomorrow, we cross from text into the multimodal frontier. Day 21 explores how models learn to **see, hear, and eventually understand the world** through multiple senses simultaneously — vision transformers, audio encoders, and the architectures that unify them into models like GPT-4V, Gemini, and beyond. The distillation and efficiency techniques you learned today will prove crucial there too: multimodal models are even more parameter-hungry, making compression not just nice-to-have but essential for real-world deployment.

---

<div style="padding: 1.5em; background: #1a1a2e; border-radius: 10px; border-left: 4px solid #e94560; margin: 1.5em 0;">

### 🧠 Test Your Knowledge

Ready to check your understanding?

**[Take the Day 20 Quiz](quizzes/day-20.toml)**

</div>
