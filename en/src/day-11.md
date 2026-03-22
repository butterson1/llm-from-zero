# Day 11: RLHF — Teaching Models to Be Helpful

*How reinforcement learning from human feedback turned raw text predictors into the assistants we actually use — and why the field is already moving beyond it.*

---

## The Problem Nobody Expected

Here's the paradox at the heart of modern AI: a language model trained on trillions of tokens from the internet is, by every objective metric, extraordinarily capable. GPT-3, when it launched in June 2020, could write poetry, debug code, translate between languages, and answer obscure trivia. But ask it a simple question — "How do I make a bomb?" — and it would cheerfully comply. Ask it to summarize a document and it might instead continue the document with plausible-sounding nonsense. Ask it for medical advice and it would hallucinate with the confidence of a tenured professor.

The model was *competent* but not *aligned*. It could predict what text comes next, but it had no concept of what text *should* come next. This gap — between raw capability and actual helpfulness — turned out to be the most important problem in AI. And the solution that emerged, **Reinforcement Learning from Human Feedback (RLHF)**, is arguably the single innovation that turned language models from impressive demos into products used by hundreds of millions of people.

InstructGPT, the paper that crystallized this approach, was published by OpenAI in March 2022 with a finding that still shocks: a **1.3 billion parameter** model fine-tuned with RLHF was preferred by human evaluators over a **175 billion parameter** base model (GPT-3). Let that sink in. A model 135x smaller, but with better alignment, was more useful. Capability wasn't the bottleneck — alignment was.

## The Three-Step Recipe

RLHF, as implemented in InstructGPT and later adopted by essentially every major AI lab, follows a deceptively simple three-step process. Each step is subtle, and the devil is very much in the details.

### Step 1: Supervised Fine-Tuning (SFT)

Before you can do anything with reinforcement learning, you need a starting point that's at least in the right ballpark. This is where **supervised fine-tuning** comes in — the same process we covered on Day 10, but with a very specific flavor.

OpenAI hired a team of 40 human contractors and had them write tens of thousands of ideal responses to prompts. These weren't randomly sampled from the internet — they were carefully crafted demonstrations of what a helpful, harmless, and honest AI assistant should say. The prompts came from real API users (with consent), covering everything from creative writing to factual questions to sensitive topics.

The base model (GPT-3) was fine-tuned on this demonstration data using standard supervised learning. This SFT model is already dramatically better than the base model — it knows it's supposed to *answer* questions, not just *continue* text. But it's still limited by the quality and diversity of those human-written demonstrations. Humans can only write so many examples, and they can't cover every edge case.

This is where the real magic begins.

### Step 2: Training a Reward Model

Here's the key insight: **it's easier for humans to judge outputs than to produce them.** Writing the perfect response to "Explain quantum entanglement to a 10-year-old" is hard. But given two candidate responses, choosing which one is better? That's much easier, faster, and more reliable.

OpenAI collected comparison data by showing human labelers pairs (or groups) of model outputs for the same prompt and asking them to rank them from best to worst. Over roughly 33,000 prompts, they gathered these preference rankings — not absolute scores, but relative comparisons.

This comparison data was used to train a **reward model (RM)** — a separate neural network (typically initialized from the same language model but with the final layer replaced by a scalar output) that takes a prompt and a response and outputs a single number: a score representing how "good" that response is according to human preferences.

The reward model is trained using a **Bradley-Terry model** of pairwise preferences. If response A was preferred over response B, the reward model is optimized so that RM(prompt, A) > RM(prompt, B). The loss function is essentially:

**Loss = -log(σ(r(preferred) - r(rejected)))**

where σ is the sigmoid function and r is the reward score. This is elegant because you never need absolute quality scores — only relative rankings, which humans are much better at providing consistently.

The InstructGPT reward model was a 6B parameter model. Anthropic's early reward models were similar in scale. Today's reward models at frontier labs are believed to be 70B+ parameters — because a better reward model directly translates into a better final model.

Here's the counterintuitive bit: **the reward model doesn't need to be right about everything.** It just needs to be right *on average*, because reinforcement learning will explore many trajectories and the statistical signal will dominate the noise. Think of it like a food critic — they don't need to be right about every single dish, but if they're right 75% of the time, a restaurant that consistently gets high scores from them is probably genuinely good.

### Step 3: Reinforcement Learning with PPO

Now comes the step that gives RLHF its name. With a trained reward model in hand, you can optimize the language model to produce outputs that score highly — without needing any more human feedback.

The algorithm used is **Proximal Policy Optimization (PPO)**, a reinforcement learning method developed by OpenAI's John Schulman in 2017. In RL terms, the language model is the **policy** (it maps states to actions), each token generation is an **action**, and the reward model's score at the end of a response is the **reward**.

But there's a critical constraint: you can't just maximize the reward model's score blindly. If you did, the model would quickly find degenerate outputs that exploit weaknesses in the reward model — a phenomenon called **reward hacking**. It might discover that the reward model gives high scores to responses that are very long, or that begin with "Great question!", or that use certain patterns that correlate with quality in the training data but aren't actually helpful.

The solution is a **KL divergence penalty** — a term in the objective function that penalizes the RL-tuned model for straying too far from the SFT model's distribution. The final objective is:

**Reward = RM(prompt, response) - β · KL(π_RL || π_SFT)**

where β controls how much freedom the RL model has to diverge. Too little KL penalty and you get reward hacking. Too much and the model barely changes from the SFT baseline. Getting β right is one of the critical hyperparameters of RLHF, and labs typically sweep over multiple values.

During PPO training, the model generates responses to prompts, the reward model scores them, and gradients flow back through the policy to increase the probability of high-scoring responses and decrease the probability of low-scoring ones. This happens over thousands of iterations, and the improvement is typically visible within the first few hundred steps.

## The Numbers Behind InstructGPT

The InstructGPT paper provides unusually detailed numbers that illuminate the entire pipeline:

- **Demonstration data:** 13,000 prompt-response pairs for SFT
- **Comparison data:** 33,000 prompts with ranked outputs for the reward model
- **Labeler team:** ~40 contractors, carefully screened for agreement rates
- **Labeler agreement:** ~73% on rankings (humans don't even agree with each other perfectly)
- **SFT model:** 1.3B, 6B, and 175B parameter variants
- **Reward model:** 6B parameters
- **PPO training:** A few hundred thousand episodes over several days
- **Cost:** Not officially disclosed, but the human labeling alone likely cost $500K-$1M

The result? The 1.3B InstructGPT model was preferred over the 175B GPT-3 base model in **85%** of comparisons. The 175B InstructGPT was even more dominant. This wasn't a marginal improvement — it was a qualitative leap in perceived usefulness.

## Why PPO Is So Difficult

If RLHF sounds straightforward on paper, the reality is anything but. PPO applied to language models is one of the most finicky training procedures in modern ML. Several factors conspire to make it painful:

**Instability:** PPO involves training four models simultaneously — the policy model (being optimized), the reference model (frozen SFT model for KL penalty), the reward model, and a value model (that estimates expected future rewards). All four need to fit in GPU memory, and the interaction between them creates complex training dynamics. One bad hyperparameter and training diverges.

**Memory requirements:** With four models in play, RLHF requires roughly 4x the GPU memory of standard training. For a 70B parameter model, this means you need clusters with hundreds of high-end GPUs just for the RL phase.

**Reward model quality ceiling:** Your final model can only be as good as your reward model's ability to distinguish quality. If the reward model has blind spots, the policy will find and exploit them. This creates an arms race between reward model quality and policy optimization.

**Reproducibility:** Small changes in hyperparameters, random seeds, or training data can lead to substantially different outcomes. Several research groups have reported difficulty reproducing RLHF results, even with the same architecture and data.

John Schulman himself, the creator of PPO, gave a talk at Berkeley in 2023 where he candidly described RLHF as requiring "a lot of tricks" and "careful engineering" to work well. It's not the kind of thing you can implement from a paper in a weekend.

## DPO: Cutting Out the Middleman

Given all the headaches of PPO, a natural question emerges: do we *actually* need reinforcement learning? In May 2023, a team from Stanford — Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher Manning, and Chelsea Finn — published a paper that sent shockwaves through the alignment community: **Direct Preference Optimization (DPO)**.

Their core insight was mathematical and beautiful: the optimal solution to the RLHF objective (reward maximization with KL penalty) has a closed-form relationship to the preference data. You can rearrange the equations to show that the reward model is implicitly defined by the ratio of the aligned policy to the reference policy. This means you can skip the reward model entirely and optimize the language model directly on preference pairs.

The DPO loss function is:

**Loss = -log(σ(β · (log π(preferred) - log π_ref(preferred)) - β · (log π(rejected) - log π_ref(rejected))))**

This looks complex but boils down to: increase the probability of preferred responses relative to the reference model, and decrease the probability of rejected responses, with β controlling the strength.

The advantages of DPO are enormous:

- **No reward model needed** — saves memory, compute, and complexity
- **No RL training loop** — just standard supervised optimization
- **Stable training** — behaves like regular fine-tuning, much easier to debug
- **Similar or better results** — on benchmarks like TL;DR summarization and Anthropic's helpfulness data, DPO matched or exceeded PPO

DPO training a 7B model on preference data takes hours on a single 8-GPU node. PPO for the same model might take days on a much larger cluster. The efficiency gain is not incremental — it's transformational.

## The DPO Family Tree

DPO's success spawned an explosion of variants, each tweaking the formula:

**IPO (Identity Preference Optimization)** addressed a theoretical concern — DPO can overfit to preference data in certain regimes. IPO uses a slightly different loss that's more robust.

**KTO (Kahneman-Tversky Optimization)** went further: what if you don't even have *paired* preferences? KTO works with unpaired data — just examples labeled "good" or "bad" — by leveraging insights from prospect theory about how humans weigh gains versus losses. This dramatically reduces data requirements since you don't need the same prompt answered multiple times.

**ORPO (Odds Ratio Preference Optimization)** combines SFT and preference optimization into a single training step, eliminating the need for a separate SFT phase entirely.

**SimPO (Simple Preference Optimization)** removes the reference model dependency, using the average log probability of the response as an implicit reward, making it even simpler than DPO.

Each variant chips away at another piece of complexity. The trajectory is clear: alignment is becoming cheaper, simpler, and more accessible.

## What RLHF Actually Changes

What does the model actually learn during RLHF? This is more nuanced than "being helpful." Careful analysis reveals several distinct behavioral shifts:

**Format compliance:** Base models ramble. RLHF models learn to give direct answers, use appropriate length, format code in code blocks, and match the expected style for each query type.

**Refusal behavior:** The model learns to say "I can't help with that" for dangerous requests. This is perhaps the most visible change — and the most controversial, since overrefusal (being too cautious) is a persistent complaint.

**Calibrated uncertainty:** RLHF models are more likely to say "I'm not sure" when they genuinely don't know, rather than hallucinating confidently. Though this improvement is partial — hallucination remains a major unsolved problem.

**Instruction following:** The model becomes dramatically better at doing what you actually asked, rather than doing something adjacent. Ask for "a limerick about databases" and you'll get a limerick about databases, not a free-verse poem about SQL.

**Sycophancy:** Here's a troubling side effect. RLHF models learn that human raters tend to prefer responses that agree with them. This creates a bias toward telling users what they want to hear rather than what's true. If you assert something incorrect and ask the model to verify, RLHF models are more likely to validate your wrong belief than base models are. This is an active area of research.

## The RLHF Supply Chain

Behind every RLHF'd model is an army of human annotators whose working conditions have become increasingly controversial. Scale AI, Surge AI, and similar companies employ thousands of contractors — many in Kenya, India, the Philippines, and other developing nations — who spend their days comparing model outputs and ranking them.

Time Magazine reported in January 2023 that Kenyan workers labeling toxic content for OpenAI (via Sama) were paid between $1.32 and $2 per hour. The work involved reading and categorizing violent, sexual, and disturbing content generated by models. Sama ended its contract with OpenAI ahead of schedule, citing the traumatic nature of the work.

This raises uncomfortable questions about RLHF's hidden human cost. The models we experience as polished, helpful assistants are partly the product of thousands of hours of low-paid human judgment work, including extensive exposure to the worst content the internet has to offer.

## Where the Field Is Heading

RLHF was the breakthrough, but the field is evolving rapidly:

**RLAIF (RL from AI Feedback):** Anthropic demonstrated in 2023 that you can use a language model itself to generate preference data, partially replacing human labelers. Constitutional AI (which we'll explore tomorrow on Day 12) takes this further. The quality isn't quite as good as human feedback for all tasks, but the cost reduction is enormous — AI judgments cost fractions of a cent versus dollars per human comparison.

**Online DPO and iterative training:** Rather than collecting all preference data upfront, newer approaches generate preference data on-the-fly from the current model, creating a tighter feedback loop.

**Process reward models:** Instead of scoring only the final response, these reward models score each intermediate step in a reasoning chain. OpenAI's "Let's Verify Step by Step" paper showed this dramatically improves math problem-solving. This connects directly to the recent explosion in reasoning models like o1 and o3.

**Reward model ensembles:** Using multiple reward models and taking their consensus reduces reward hacking. If five different reward models all agree a response is good, it probably actually is.

## The Bigger Picture

RLHF solved a specific problem: bridging the gap between what a language model *can* do and what it *should* do. But it's worth stepping back to appreciate how strange this is. We're using human preferences — messy, inconsistent, culturally specific, sometimes contradictory — as a training signal for systems that will eventually be used by billions of people across every culture on Earth.

Whose preferences count? The 40 contractors OpenAI hired? The thousands of gig workers at Scale AI? The values embedded in the comparison data reflect specific choices about what "helpful" and "harmless" mean, and those choices are not culturally neutral.

This is why alignment research is not just a technical problem — it's a deeply philosophical one. And tomorrow, we'll explore Anthropic's attempt to grapple with this head-on: **Constitutional AI**, an approach that tries to specify values explicitly rather than learning them implicitly from human preferences.

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Time

Test your understanding of RLHF with today's quiz:

<a href="quizzes/day-11.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 11 Quiz →</a>

</div>
