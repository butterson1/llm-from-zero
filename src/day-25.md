# Day 25: The Economics — Inference Costs, API Pricing, and Who's Making Money

*How a single ChatGPT conversation might cost $0.003 but OpenAI still burns billions — and why the entire AI industry is locked in a bet that unit economics will flip before the money runs out.*

---

## The Most Expensive Software Ever Built

Here's a number that should stop you cold: OpenAI reportedly spent over **$5 billion** more than it earned in 2024. Not on research. Not on salaries. Primarily on the compute required to *run* the models it had already built. Training GPT-4 was expensive — somewhere around $100 million by most estimates — but that was a one-time cost. Serving it to 200+ million weekly users? That's the meter that never stops running.

This is the central economic paradox of the LLM era. Training is a capital expenditure: you pay it once, and you have an asset. Inference is an operating expense: every single query, every token generated, burns GPU-seconds that you can never get back. And as AI products get more popular, that burn rate doesn't stabilize — it *accelerates*.

To understand why the economics of AI look the way they do, you need to understand what actually happens when you send a message to Claude or ChatGPT — not at the software level (we covered that in Day 19), but at the dollar level.

## The Anatomy of an Inference Dollar

When you type a prompt into an API and get a response, here's roughly where each dollar goes:

**GPU compute** eats the lion's share — typically 60-80% of the cost. An NVIDIA H100 GPU costs around $25,000-$35,000 (when you can get one), and a single server with 8 H100s runs $250,000-$300,000. Cloud rental prices from AWS, Azure, or GCP range from $2-4 per GPU-hour for H100s. A large model like GPT-4 or Claude 3.5 Sonnet requires multiple GPUs working in concert for every single request, because the model's parameters don't fit on one chip.

**Memory bandwidth**, not raw compute, is often the actual bottleneck. As we learned on Day 19, autoregressive generation is fundamentally memory-bound: each token requires reading the entire model's weights from GPU memory. An H100 has 3.35 TB/s of memory bandwidth. A 70B parameter model in FP16 occupies 140 GB. Reading those weights once takes about 42 milliseconds. For each token. This is why generating a 500-token response requires 500 sequential reads of 140 GB each — roughly 70 TB of memory traffic for one conversation.

**Networking and storage** add another 10-15%. The KV cache for long conversations must be stored somewhere, requests need load-balancing across thousands of GPUs, and the results need to travel back to the user with acceptable latency.

**Electricity** is the silent killer. A single H100 draws about 700W under load. A cluster of 10,000 H100s — a modest deployment by frontier lab standards — consumes 7 MW, enough to power about 5,000 homes. At $0.05-0.10/kWh for industrial power, that's $3-6 million per year just in electricity for one cluster. Microsoft's total AI-related power consumption is estimated to have pushed past 5 GW by late 2025.

**Overhead** — software engineering, monitoring, safety systems, customer support, the building the servers sit in — typically adds 15-25% on top of raw compute costs.

## The Price War Nobody Expected

In early 2023, accessing GPT-4-class intelligence cost $0.03 per 1,000 input tokens and $0.06 per 1,000 output tokens through OpenAI's API. A typical conversation (1,000 tokens in, 500 out) ran about $0.06. Expensive enough that developers watched their billing dashboards like hawks.

Then the floor fell out.

By mid-2025, the pricing landscape had transformed beyond recognition. Here's a snapshot of what frontier-class intelligence costs across major providers:

| Provider | Model | Input (per 1M tokens) | Output (per 1M tokens) |
|----------|-------|----------------------|------------------------|
| OpenAI | GPT-4o | $2.50 | $10.00 |
| OpenAI | GPT-4o mini | $0.15 | $0.60 |
| Anthropic | Claude 3.5 Sonnet | $3.00 | $15.00 |
| Anthropic | Claude 3.5 Haiku | $0.80 | $4.00 |
| Google | Gemini 1.5 Flash | $0.075 | $0.30 |
| DeepSeek | DeepSeek-V3 | $0.27 | $1.10 |

That's a **100x reduction** in cost-per-token for comparable quality in roughly two years. Nothing in the history of software has seen cost compression this dramatic, this fast. Even Moore's Law, at its most aggressive, only delivered a 2x improvement every 18 months.

How did this happen? Three reinforcing dynamics:

**Hardware improvements:** The jump from A100 to H100 GPUs delivered roughly 3x better inference throughput per dollar. The H200 (with its 141 GB HBM3e) pushed that further. And NVIDIA's B200 Blackwell GPUs, shipping through 2025, promise another 2-4x improvement for inference workloads specifically, thanks to a dedicated "transformer engine" that exploits FP4 precision.

**Algorithmic efficiency:** The techniques from Days 19-20 — quantization, speculative decoding, KV cache optimization, grouped-query attention — compound multiplicatively. A model quantized to INT4 uses 4x less memory than FP16, which means 4x more requests per GPU. Speculative decoding can improve throughput by 2-3x. PagedAttention (vLLM) eliminated KV cache memory waste, boosting effective throughput another 2-4x. Combined, these optimizations can deliver 20-40x better throughput versus naive FP16 serving.

**Competition:** DeepSeek's arrival in late 2024 broke the pricing cartel. Their V3 model, trained for a reported $5.6 million using clever FP8 training and multi-head latent attention, offered GPT-4-level performance at a fraction of the price. When a Chinese lab demonstrates that frontier-quality inference can be served profitably at $0.27 per million input tokens, it becomes very hard for American labs to justify charging 10-50x more.

## The Bathtub Curve: Why Reasoning Models Break the Price Story

Just when it looked like inference costs were on an irreversible downward trajectory, reasoning models threw a wrench into the narrative.

OpenAI's o1 model, launched in late 2024, introduced a new paradigm: instead of generating answers in a single forward pass, it *thinks* — generating hundreds or thousands of hidden reasoning tokens before producing a visible response. The quality improvement is dramatic (o1 scored 83% on competition math problems where GPT-4 scored 13%), but the cost implications are severe.

A single o1 query might generate 10,000-50,000 internal reasoning tokens before producing a 500-token answer. At $15 per million input tokens and $60 per million output tokens (o1's launch pricing), a complex math problem could cost $0.50-$3.00 to solve. That's 100-1,000x more expensive than a GPT-4o query.

This creates what you might call the **bathtub curve** of AI pricing: costs dropped steeply for standard generation (the left side of the tub), but reasoning models pushed the ceiling back up for complex tasks (the right side). The bottom of the tub — cheap, fast, good-enough inference — is where most volume lives. But the highest-value tasks (coding, research, analysis) increasingly demand the expensive reasoning models.

Anthropic's Claude 3.5 Opus and Google's Gemini 2.0 Ultra followed similar trajectories: extended thinking modes that trade compute for quality, at dramatically higher per-query costs. The market is bifurcating into "fast and cheap" (Haiku, Flash, GPT-4o mini) and "slow and expensive" (o1, extended thinking, deep research).

## Who's Actually Making Money?

The uncomfortable truth: almost nobody in the LLM application layer is profitable yet. But the *infrastructure* layer is printing money.

### NVIDIA: The Arms Dealer

NVIDIA's data center revenue hit **$115 billion** in fiscal year 2025 (ending January 2026), up from $47.5 billion the prior year. Their gross margins hover around 73-75% — extraordinary for a hardware company. Every major AI lab, every cloud provider, every enterprise AI deployment runs on NVIDIA GPUs. Jensen Huang has essentially positioned NVIDIA as the OPEC of artificial intelligence: controlling the critical resource that everyone needs and nobody else can supply in sufficient quantity.

The H100 alone generated more revenue than many entire tech companies. And with Blackwell (B200/GB200), NVIDIA created an upgrade cycle so compelling that customers placed orders worth tens of billions before the chips even shipped.

### Cloud Providers: The Landlords

Microsoft (Azure), Amazon (AWS), and Google (GCP) are the primary beneficiaries of the AI capex boom. When a startup raises $100 million to build an AI product, roughly $70-80 million of that ends up flowing to cloud providers for compute. Microsoft's "AI-related" cloud revenue reportedly exceeded $13 billion in annual run rate by the end of 2025, and Azure's growth reaccelerated to 30%+ year-over-year partly on AI workload demand.

The cloud providers' genius move was realizing they don't need to *win* the model race. They just need to be the platform where *everyone else* races. Azure hosts OpenAI. AWS hosts Anthropic (thanks to a $4 billion investment). GCP hosts Google's own models. All three host open-source models. Whoever wins the model war, the cloud providers collect rent.

### API Providers: The Toll Booth Operators

OpenAI's annual revenue reportedly hit **$5-6 billion** by early 2026, growing from about $3.4 billion in 2024. That sounds impressive until you learn they spent $5+ billion more than they earned. ChatGPT Plus subscriptions ($20/month, ~10 million subscribers) generate roughly $2.4 billion annually. API revenue — developers paying per-token — makes up most of the rest.

Anthropic reportedly reached **$1 billion+** in annualized revenue by late 2025, primarily from API sales to enterprises. Their strategy of focusing on safety and enterprise reliability (longer contexts, better instruction-following, consistent formatting) positioned Claude as the default for professional applications.

But here's the critical question: are these *sustainable* businesses, or are they burning through venture capital to subsidize usage and grab market share? OpenAI's pricing suggests the latter. When GPT-4o mini costs $0.15 per million input tokens and a single H100 can serve maybe 5-10 million tokens per hour at a cost of $3-4, the margins look razor-thin before you account for networking, orchestration, safety filtering, and all the other infrastructure.

### The Application Layer: Still Searching

The application layer — companies building products on top of LLMs — is where the economics get most precarious. A typical AI startup might spend 40-60% of revenue on inference costs alone. Compare that to traditional SaaS, where gross margins typically run 75-85%. This "AI tax" on gross margins means AI startups need dramatically higher revenue per customer to achieve the same profitability as traditional software companies.

Some startups have found defensible niches: Cursor (AI-powered code editor) reportedly hit $100 million+ ARR by early 2026, largely by deeply integrating AI into a developer workflow where productivity gains justify premium pricing. Harvey AI (legal) and Glean (enterprise search) have built domain-specific moats. But for every success, dozens of "GPT wrapper" startups have discovered that their entire value proposition can be replicated by a well-crafted system prompt.

## The Jevons Paradox and the Demand Curve

Here's the counterintuitive insight that makes bulls optimistic despite the current bloodbath: **Jevons Paradox**. In 1865, economist William Stanley Jevons observed that as coal engines became more efficient, total coal consumption *increased* because cheaper energy enabled new use cases. The same dynamic is playing out in AI.

When inference costs drop 10x, usage doesn't just grow 10x — it can grow 100x or 1,000x, because entirely new applications become economically viable. At $0.06 per conversation, you'd only use GPT-4 for high-value queries. At $0.001 per conversation, you'd use it to proofread every email, summarize every meeting, pre-screen every customer support ticket, review every code commit.

The data supports this. OpenAI's API call volume has grown faster than prices have fallen, meaning total revenue increased even as per-token prices dropped by orders of magnitude. Anthropic reported similar dynamics: price cuts on Claude Haiku led to usage increases that more than compensated for the revenue-per-query decrease.

This is also why the "race to zero" on API pricing might not be the catastrophe it appears. If AI inference becomes as cheap as electricity — a utility priced at fractions of a cent — the total addressable market expands from "knowledge workers asking complex questions" to "every piece of software on earth having an intelligent layer." That's not a $100 billion market. That's a multi-trillion-dollar transformation of the entire software industry.

## The Surprising Math of Self-Hosting

The open-source revolution (which we'll explore tomorrow on Day 26) has created a parallel economic track: self-hosting. When Meta released Llama 3.1 405B, it became possible for organizations to run GPT-4-class models on their own hardware. But should they?

The math is nuanced. Renting an 8xH100 node from a cloud provider costs roughly $25-30 per hour. Running Llama 3.1 405B (quantized to INT4) requires two such nodes. At $50-60/hour, that's $1,200-1,440/day or roughly $43,000-52,000/month. If your organization makes fewer than ~15-20 million API calls per month, you're probably better off using Anthropic's or OpenAI's API. Above that threshold, self-hosting starts winning — and the savings compound as volume grows.

But the hidden costs are real: ML engineers to operate the stack ($200-400K/year), infrastructure monitoring, model updates, safety guardrails you now have to build yourself. Companies like Anyscale, Together AI, and Fireworks AI have built businesses in this gap — offering API-like simplicity with self-hosting-like economics by running open-source models on optimized infrastructure.

## Where the Money Will Be

The AI economics story is still in its opening chapter. Three structural shifts will determine who captures the value:

**Custom silicon** is coming. Google's TPUv5e already offers competitive inference economics. Amazon's Trainium2 chips promise 4x better price-performance than NVIDIA GPUs for training. Microsoft is developing Maia. If any of these succeed at scale, NVIDIA's pricing power erodes, and inference costs could fall another 5-10x.

**Inference efficiency** has more room to run. Techniques like mixture-of-experts (only activating 10-20% of parameters per query), early exit strategies, and model cascading (using a cheap model first, escalating to an expensive one only when needed) could deliver another order of magnitude in cost reduction.

**The application layer will mature.** Today's AI economics look like the early internet: massive infrastructure spending, thin application margins, and a bet on future scale. Amazon lost money for a decade before becoming the most valuable retailer on earth. The AI companies burning billions today are making a similar bet — that the use cases enabled by cheap, intelligent inference will eventually generate returns that dwarf the current investment.

The question isn't whether AI will be economically viable. It's whether the companies spending the most *right now* will be the ones to capture that value — or whether, like the telecom companies that laid the fiber optic cables in the 1990s, they'll build the infrastructure that makes *someone else* rich.

---

*Tomorrow on Day 26, we dive into the most contentious question in AI: open source vs closed. Meta gave away Llama 3.1 405B — a model that cost hundreds of millions to train — for free. Why? The answer reveals a fascinating strategic game where giving things away might be the most profitable move of all.*

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Day 25 Quiz

Test your understanding of AI economics before moving on:

<a href="quizzes/day-25.toml" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">📝 Take the Day 25 Quiz</a>

</div>
