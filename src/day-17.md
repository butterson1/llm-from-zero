# Day 17: Mixture of Experts — How Sparse Models Get Big Without the Compute Cost

*There's a dirty secret behind the most powerful language models in the world: most of the parameters aren't doing anything on any given input.*

---

## The Impossible Tradeoff

By Day 7, you learned the fundamental scaling laws: bigger models are smarter models. More parameters, more data, more compute — the curves go up and to the right with remarkable predictability. By Day 15, you watched GPT-4 hit an estimated 1.8 trillion parameters and deliver genuinely transformative capabilities.

But here's the problem nobody talks about at the keynote: a 1.8 trillion parameter dense model — one where every parameter activates on every token — would be *catastrophically* expensive to run. At FP16 precision, just loading those weights into memory requires 3.6 terabytes of VRAM. Running inference on a single prompt would demand a small data center's worth of H100s firing in concert. The electricity bill alone would make the API pricing untenable.

So how does GPT-4 actually work? How does Google serve Gemini 1.5 to hundreds of millions of users? How did Mistral, a startup with a fraction of Google's resources, build models that compete with giants?

The answer is one of the most elegant ideas in machine learning: **Mixture of Experts (MoE)**. Instead of using all your parameters all the time, you use a small fraction of them for each token — choosing which fraction based on what the token needs. It's like having a hospital full of specialists rather than one doctor who knows everything: the total knowledge is enormous, but any given patient only sees two or three experts.

## The Core Idea: Conditional Computation

The concept of mixture of experts predates modern deep learning by decades. In 1991, Robert Jacobs, Michael Jordan (the professor, not the basketball player), Steven Nowlan, and Geoffrey Hinton published "Adaptive Mixtures of Local Experts," proposing a system where different neural networks specialize in different parts of the input space, and a "gating network" decides which expert handles each input.

The idea lay relatively dormant for years because dense models kept getting better and the engineering challenges of conditional computation — where different inputs take different paths through the network — were brutal. GPUs are optimized for doing the same operation on everything simultaneously. Branching is the enemy of parallelism.

The modern MoE renaissance began in 2017 when Noam Shazeer (the same researcher behind multi-head attention in the original Transformer paper) and colleagues at Google published "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer." They built a model with up to 137 billion parameters — enormous for 2017 — but only activated a fraction on each input. The key insight was integrating expert layers directly into the Transformer architecture.

Here's how it works in practice:

### The Architecture

In a standard Transformer (Day 4), each layer has two main components: a self-attention block and a feed-forward network (FFN). In an MoE Transformer, you replace some or all of the FFN blocks with MoE layers. Each MoE layer contains:

1. **Multiple expert networks** — typically 8, 16, or even 64 separate FFN blocks, each with its own parameters
2. **A router (gating network)** — a small neural network that looks at each token and decides which experts should process it

For each incoming token, the router produces a probability distribution over all experts. Then, typically, only the **top-k experts** (usually k=1 or k=2) actually process the token. The outputs of those experts are combined using the router's probability weights.

The math is straightforward. If you have 8 experts and route each token to 2 of them, you have 8× the total parameters of a dense model but only 2× the compute cost per token (roughly 25% of total parameters active). Scale that to 16 experts with top-2 routing, and you're using about 12.5% of parameters per token. The model is *massive* in total knowledge but *lean* in computation.

### The Numbers That Matter

Let's make this concrete with real models:

- **Mixtral 8x7B** (Mistral, December 2023): 8 experts of ~7B parameters each, top-2 routing. Total parameters: ~46.7B. Active parameters per token: ~12.9B. This means it has the *knowledge capacity* approaching a 47B model but runs at roughly the cost of a 13B dense model. It matched or beat LLaMA 2 70B on most benchmarks — a dense model with 5× its active compute cost.

- **GPT-4** (OpenAI, March 2023): According to leaked details (which OpenAI has never confirmed), GPT-4 uses 16 experts with top-2 routing, totaling approximately 1.76 trillion parameters with ~280B active per forward pass. This means despite being "1.8 trillion parameters," GPT-4's inference cost is closer to running a 280B dense model — still enormous, but roughly 6× cheaper than a fully dense 1.8T model would be.

- **Gemini 1.5 Pro** (Google, February 2024): Reported to use a MoE architecture, with the technical report confirming it but withholding specifics. Google's earlier Switch Transformer research (2021) explored up to 1.6 trillion parameters with top-1 routing, and Gemini likely pushes this further.

- **DeepSeek-V2** (DeepSeek, May 2024): 236B total parameters, only 21B active per token. DeepSeek pioneered "DeepSeekMoE" with finer-grained experts — 160 small experts instead of 8-16 large ones, with top-6 routing plus 2 shared experts. This achieved stronger specialization with more granular routing decisions.

- **Arctic** (Snowflake, April 2024): 480B total parameters, 17B active. Used a "Dense-MoE Hybrid" with a 10B dense transformer combined with 128 fine-grained experts (3.66B each, top-2 routing), explicitly optimized for enterprise workloads.

## The Router: Where the Magic (and the Trouble) Happens

The gating network is deceptively simple — often just a single linear layer that takes a token's hidden state and outputs logits over all experts. Apply softmax, take the top-k, done.

But this simplicity belies deep challenges.

### Load Balancing: The Expert Collapse Problem

Left to its own devices, the router will often collapse into sending most tokens to just one or two "favorite" experts, while the others starve. This is *expert collapse* — the model fails to utilize its full capacity. It's like a hospital where every patient gets sent to the same overworked doctor while the other specialists sit idle.

Why does this happen? Reinforcement dynamics. If expert #3 happens to be slightly better at a common pattern early in training, the router sends more tokens to it. Expert #3 gets more gradient signal, improves further, and becomes even more preferred. Meanwhile, experts that rarely activate get sparse gradients and fall behind. Classic rich-get-richer dynamics.

The solution is an **auxiliary load-balancing loss** — an extra term in the training objective that penalizes the router for distributing tokens unevenly. Shazeer's 2017 paper introduced this, and every MoE model since has used some variant. The balance coefficient is a critical hyperparameter: too low and experts collapse, too high and the router ignores token semantics and distributes randomly, negating the whole point of specialization.

Google's Switch Transformer (2021, by William Fedus, Barret Zoph, and Noam Shazeer) simplified things dramatically by using **top-1 routing** — each token goes to exactly one expert. This reduced communication overhead, simplified the load-balancing math, and, surprisingly, worked just as well or better than top-2 for many tasks. They also introduced a simple "capacity factor" that caps how many tokens any single expert can process in a batch, dropping excess tokens (which sounds terrifying but works fine because the model learns to route more evenly).

### What Do Experts Actually Specialize In?

This is where MoE gets genuinely surprising: **nobody fully understands what individual experts learn.**

Early intuition suggested experts would specialize semantically — one expert for science, another for code, another for creative writing. The reality is messier and more interesting. Research by Angela Fan and colleagues at Meta found that expert specialization tends to be more *syntactic* and *positional* than semantic. Some experts specialize in processing tokens at the beginning of sentences. Others handle rare tokens or specific grammatical structures.

In Mixtral 8x7B, analysis showed that experts don't neatly divide by topic. The same token in a math problem and a poem might route to the same expert — not because they share a topic but because they share a structural role in the sequence. Some experts seem to function as "generalists" that activate broadly, while others are narrow specialists for particular token patterns.

DeepSeek's approach of using many small experts (160 instead of 8) partially addresses this by enabling finer-grained specialization. With more experts, each can carve out a narrower niche, and the routing becomes more expressive. Their research showed this fine-grained approach outperformed coarse-grained MoE at equivalent compute budgets.

## Training MoE Models: Harder Than It Looks

MoE models are notoriously more difficult to train than dense models. Several challenges compound:

**Training instability.** MoE models are prone to training loss spikes — sudden jumps in loss that can derail training. The router's discrete decisions create a discontinuous optimization landscape. Google's ST-MoE paper (2022) documented this extensively and proposed "router z-loss," an additional regularization term that penalizes large logits in the router and smooths training. This, combined with careful learning rate warmup and gradient clipping, tames most instabilities.

**Memory overhead.** Even though MoE models use fewer FLOPs per token, they still need to store *all* expert parameters in memory (or have a fast way to swap them in). A 1.8T parameter MoE model still requires 3.6TB of memory to hold the weights, even if only 280B are active at once. This means MoE doesn't save you on GPU *count* for serving — it saves you on GPU *compute time*. You still need massive clusters, but each forward pass finishes faster.

**Communication costs.** In a distributed training setup, different experts often live on different GPUs. The router's decisions mean tokens need to be *shipped* across the network to their assigned experts and the results shipped back. This "all-to-all" communication pattern is one of the most demanding networking operations in distributed computing. High-bandwidth interconnects like NVLink (900 GB/s on H100s) and InfiniBand (400 Gb/s) are essential. On slower networks, communication can dominate compute time, negating MoE's efficiency advantage.

**Expert parallelism.** MoE introduces a fourth dimension of parallelism beyond the data, tensor, and pipeline parallelism you learned in Day 8. Each GPU hosts a subset of experts, and tokens flow between GPUs based on routing decisions. Getting this right requires careful co-design of the routing algorithm and the distributed systems layer. Google's GShard (2020) pioneered practical expert parallelism at scale, enabling training of 600B parameter MoE models across thousands of TPU chips.

## The Counterintuitive Truth About MoE Efficiency

Here's something that surprises most people: **MoE models are more parameter-efficient but less sample-efficient than dense models.**

Let me unpack that. A Mixtral 8x7B model with ~13B active parameters outperforms a dense 13B model — that's parameter efficiency. The MoE model stores more knowledge per active FLOP. But to reach the *same* performance level as a dense model, an MoE model typically needs to see *more* training tokens, not fewer.

Why? Because each expert only sees a fraction of the training data (the tokens routed to it). If you train on 1 trillion tokens with 8 experts and top-2 routing, each expert effectively sees about 250 billion tokens — one quarter of the dataset. The router somewhat compensates by sending similar tokens to the same experts, creating focused training, but the fundamental data dilution remains.

This is why recent MoE models are trained on massive token counts. Mixtral was trained on an undisclosed but reportedly very large corpus. DeepSeek-V2 was trained on 8.1 trillion tokens. The inference savings justify the extra training compute: you train once but serve millions of times.

## MoE at Inference: Where the Savings Actually Land

The real payoff of MoE comes at inference time. Consider the economics:

A dense 70B model requires about 140GB of VRAM (FP16) and roughly 140 TFLOPs per forward pass. Mixtral 8x7B, despite having 47B total parameters (94GB VRAM in FP16), uses only ~26 TFLOPs per forward pass thanks to top-2 routing through ~13B active parameters. That's roughly 5× fewer FLOPs than the dense 70B model it matches in quality.

At API scale, where you're serving millions of requests per day, this translates directly to fewer GPUs needed, lower electricity bills, and cheaper per-token pricing. This is why Mistral could offer competitive API pricing from day one — their model architecture was purpose-built for inference efficiency.

But there's a catch: **batch efficiency.** In a dense model, every token in a batch takes the same path through the network, which is perfect for GPU parallelism. In an MoE model, different tokens in the same batch may route to different experts, creating an uneven workload. If 80% of tokens in a batch go to expert #3 and 20% go to expert #7, expert #3 becomes a bottleneck while expert #7 sits mostly idle.

Techniques like "expert buffering" and "token dropping" mitigate this, but MoE's theoretical FLOP savings are rarely fully realized in practice. Real-world throughput improvements are typically 2-3× over equivalent-quality dense models, not the 4-8× the parameter ratios might suggest.

## The Frontier: Where MoE Is Going

The trend in 2024-2025 has been toward ever-finer-grained experts and more sophisticated routing:

**DeepSeek-V3** (December 2024) pushed the fine-grained approach further with 256 routed experts plus 1 shared expert, using "auxiliary-loss-free load balancing" — a clever approach where a per-expert bias term is adjusted dynamically instead of using the traditional auxiliary loss. This eliminated the tension between load balancing and routing quality. With 671B total parameters and 37B active, it matched GPT-4o and Claude 3.5 Sonnet while being trainable for just $5.6 million in compute — a fraction of what those models cost.

**Mixture-of-Depths** (Google, 2024): Instead of routing tokens to different experts within a layer, route tokens to *skip entire layers*. Easy tokens take a shallow path through the network; hard tokens take a deep path. This is the natural evolution of conditional computation — not just choosing *which* computation, but choosing *how much* computation.

**Soft MoE** (Google, 2023): Instead of hard routing decisions (token goes to expert A or B), blend tokens softly across experts using continuous weights. This eliminates the discrete routing problem and its load-balancing headaches, at the cost of some interpretability and slightly higher compute.

## Why This Matters

Mixture of Experts represents something profound about the future of AI: **the recognition that intelligence doesn't require brute force.** A human brain doesn't fire all 86 billion neurons for every thought. Different tasks activate different neural circuits. MoE is, in a very loose sense, the machine learning world arriving at the same insight.

The practical implications are enormous. MoE is what makes it economically feasible to deploy models with trillions of parameters. Without it, GPT-4 either wouldn't exist or would cost 5-10× more per query. Without it, Mistral couldn't compete with companies that have 100× its budget. Without it, the dream of running powerful models on consumer hardware through quantized MoE (like Mixtral running on a MacBook Pro) would be impossible.

As models continue to grow — and all evidence suggests they will — MoE isn't just an optimization trick. It's becoming the default architecture for frontier models. The question is no longer "should we use MoE?" but "how many experts, how fine-grained, and how should we route?"

---

*Tomorrow, we'll explore another dimension of model scaling that's been undergoing its own revolution: **context windows**. From the original Transformer's 512-token limit to Gemini's million-token context, we'll unpack how techniques like RoPE, ALiBi, and ring attention broke open the bottleneck of how much a model can "see" at once — and why longer context isn't just about reading longer documents, but fundamentally changes what models can do.*

---

<div style="margin-top: 2em; padding: 1.5em; border-radius: 8px;">

## 📝 Quiz: Day 17

Test your understanding of Mixture of Experts:

<a href="quizzes/day-17.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 17 Quiz →</a>

</div>
