# Day 12: Constitutional AI & Safety — Alignment Without Human Labels

*How Anthropic tried to replace the opaque moral averaging of RLHF with something closer to a written legal code — and why that idea may matter far beyond one company’s chatbot.*

---

There is a strange fact at the center of modern AI safety: the same model that will calmly draft phishing emails, explain how to synthesize dangerous chemicals, or help a user rationalize self-harm can often also explain, in elegant prose, why doing those things would be wrong.

That sounds contradictory until you realize what a large language model really is. It is not a single moral agent with one coherent worldview. It is more like a vast library whose shelves contain hacking tutorials, UN declarations, Reddit arguments, ethics textbooks, customer-support scripts, and forum posts by people trying to jailbreak other models. Ask the librarian for “the next likely sentence,” and you may get whatever shelf is statistically closest. Ask for “a critique of why this answer is harmful,” and suddenly the librarian walks you to a different aisle.

**Constitutional AI** was Anthropic’s attempt to exploit that gap between generation and judgment. Instead of hiring large fleets of human contractors to rank outputs the way OpenAI’s RLHF pipeline did for InstructGPT, Anthropic asked a sharper question: what if you wrote down the principles you wanted the model to follow, and then used the model itself to critique and improve its own behavior?

The idea arrived in a December 2022 paper, **“Constitutional AI: Harmlessness from AI Feedback,”** by Yuntao Bai and colleagues at Anthropic. It was one of the first serious demonstrations that a model could be aligned not mainly by human thumbs-up/thumbs-down labels, but by an explicit textual framework — a constitution. In hindsight, it looks less like a quirky training trick and more like the opening shot in a deeper shift: from *alignment by vibes* to *alignment by specification*.

## The Problem with RLHF’s Hidden Constitution

Yesterday’s lesson on RLHF left one giant question hanging in the air. If a reward model is trained on human rankings, then whose values end up inside the model?

In **InstructGPT** (Ouyang et al., 2022), OpenAI used roughly **40 contractors** to produce demonstrations and preference rankings. That was enough to turn a raw GPT-3 derivative into something users strongly preferred: the paper’s famous result was that a **1.3 billion parameter** InstructGPT model was preferred over the **175 billion parameter** base GPT-3 model. Alignment beat scale.

But RLHF has an awkward property: its values are legible only at the input and output ends. You can inspect the prompts. You can inspect the rankings. But after that, the judgments are compressed into a reward model and then distilled into a policy through PPO. It is like taking a constitutional convention, shredding all the speeches, averaging the fragments, and saying: trust us, the spirit of the law is in there somewhere.

That opacity matters for at least three reasons.

First, **auditing**. If a model refuses a benign question about drug interactions, you often cannot say which principle caused the refusal. The model is expressing an implicit norm learned statistically from thousands of comparisons.

Second, **scaling**. Human preference labeling is expensive, slow, and psychologically ugly. The public learned this viscerally when *Time* reported in 2023 that Kenyan workers involved in OpenAI-related content labeling were being paid roughly **$1.32 to $2 per hour** to review disturbing material.

Third, **governance**. An assistant used by hundreds of millions of people is not merely a technical artifact. It is a values-delivery mechanism. If its moral boundaries come from a small contractor pool or a company-internal policy doc, that is not a trivial implementation detail. That is politics smuggled into infrastructure.

Anthropic’s answer was not to pretend values could be removed. It was to make them more explicit.

## Writing the Rules Down

The original Constitutional AI paper used a compact constitution of about **16 principles**, drawn from a strikingly eclectic mix of sources: the **UN Universal Declaration of Human Rights**, safety-oriented statements written by Anthropic researchers, and even language adapted from **Apple’s Terms of Service**. One principle asked the model to choose responses that were “most supportive and encouraging of life, liberty, and personal security.” Another favored responses with the “least objectionable, unethical, or socially harmful content.”

This sounds almost embarrassingly simple. It is also, in a way, radical.

Instead of inferring norms from preference labels, the researchers stated norms in plain language. That makes them inspectable. Arguable. Revisable. A constitution can still be bad, culturally narrow, or paternalistic. But at least it is visible. An invisible constitution is harder to contest.

And yes, the name is a bit theatrical. But it is apt. A constitution is not a full legal code; it is a higher-level set of principles that guide downstream decisions when novel situations arise. That is exactly the problem frontier models face. No static rulebook can enumerate every jailbreak, every dual-use biology question, every self-harm edge case, every ambiguous request for political persuasion. You need a set of general principles that can be applied to cases the designers did not foresee.

## Stage One: The Model Learns to Critique Itself

The first stage of Constitutional AI looks almost like supervised fine-tuning with a philosophical twist.

Start with a model that is reasonably helpful but not yet reliably harmless. Give it a user prompt that might provoke a dangerous answer. Let it respond. Then present that response back to the model with a constitutional principle and ask for a critique.

For example, if the model explains how to break into a neighbor’s Wi‑Fi, you can prompt it to identify why that answer is harmful, illegal, or privacy violating. The model critiques its own answer. Then you ask it to rewrite the answer to better satisfy the principle. The result is a cleaner, safer response.

This **critique–revision loop** is the beating heart of the method. Anthropic found that harmlessness improved as the model performed more revision passes. That is a surprising result if you imagine a language model as a single fixed personality. But it makes more sense if you imagine it as a system with multiple latent capabilities waiting for the right prompt to activate them.

A good analogy is a reckless but brilliant intern who writes an answer too fast, then does much better when forced to red-team their own draft. The intern had the judgment all along; the workflow simply failed to invoke it.

This is one of the most counterintuitive facts in the field: **a model can know that an answer is dangerous without spontaneously using that knowledge when generating the answer.** Generation and evaluation are not the same cognitive act, even inside one model.

Anthropic then used these self-revised answers as synthetic training data for supervised learning. This produced what the paper called an **SL-CAI** model — supervised-learning Constitutional AI. No human had to label which original outputs were harmful. The human role was pushed upstream into writing the constitution.

## Stage Two: RLAIF — Reinforcement Learning from AI Feedback

The second stage is where Constitutional AI stopped being a clever prompting trick and became a full alternative to RLHF.

In standard RLHF, humans compare multiple model answers and say which one is better. Anthropic replaced those humans with another model-guided process. Given two candidate responses and one constitutional principle, the model is asked which response better satisfies the principle. That produces preference data. Those preferences then train a preference model or reward model. Then reinforcement learning proceeds much as it does in RLHF.

This is **RLAIF**: **Reinforcement Learning from AI Feedback**.

The economic logic is brutal. Human comparisons are expensive and bottleneck on recruiting, training, and managing labelers. AI-generated comparisons are cheap, fast, and scalable. If a human ranking costs dollars and seconds or minutes of labor, AI feedback costs fractions of a cent and scales with GPU time.

The obvious objection is quality. Human judgment may be expensive, but isn’t it better?

Not always. In **“RLAIF vs. RLHF”** by Harrison Lee and colleagues at Google Research, the team found that AI feedback could be competitive with human feedback. On summarization tasks, **RLAIF and RLHF were preferred over an SFT baseline 71% and 73% of the time**, respectively. On helpful dialogue generation, the figures were **63% and 64%**. Statistically, that is basically a tie.

That result matters because it means Constitutional AI was not merely Anthropic’s house style. The broader idea — that models can help supervise other models — generalizes.

## Why This Sometimes Works Better Than Human Labeling

One reason Constitutional AI can outperform naive human labeling is that human raters are often **blunt instruments** on safety.

Imagine asking a contractor to rank answers to a question about opioid overdose. One answer gives accurate harm-reduction guidance, including naloxone and emergency steps. Another refuses to discuss drugs. If the rater is anxious, rushed, or trained to avoid any risky-looking response, the refusal may win. Multiply that by tens of thousands of labels and you teach the model a distorted lesson: not “distinguish help from harm,” but “stay far away from anything scary.”

This is the **alignment tax** in action: making a model safer often makes it less useful.

A written constitution can express nuance better than noisy preference labels can. It can say, in effect: provide medical harm-reduction information, but do not provide instructions for illegal drug synthesis. Those are very different acts, even if both contain vocabulary about chemicals and dosage.

That is why Constitutional AI often produces models that are **less evasive** than old-school safety tuning. It narrows the blast radius.

## Red Teaming: The Adversary You Need

Of course, no constitution survives first contact with the internet.

That is why modern safety stacks pair constitutional training with **red teaming**. Anthropic’s 2022 paper **“Red Teaming Language Models to Reduce Harms”** involved **324 crowd workers** generating attacks and produced a dataset of **38,961 red-team prompts**. The researchers tested different model sizes — including **2.7B, 13B, and 52B parameter** systems — and different alignment methods to see which models failed where.

Red teaming matters because alignment failure is often adversarial, not average-case. A model may behave well for 99% of ordinary users and still be vulnerable to carefully constructed jailbreaks: roleplay frames, translation detours, coding wrappers, or adversarial suffixes that turn a refusal into compliance.

Anthropic and others also explored **automated red teaming** — using language models to generate attacks against other language models. That scales far beyond human adversaries. A human red team might generate hundreds of attacks per day. Automated systems can generate hundreds of thousands, probing the safety boundary the way waves test every crack in a seawall.

This is one of the deep lessons of AI safety: alignment is not a one-time property you install. It is more like cybersecurity. You harden the system, attackers adapt, you discover a weird failure mode, you patch the training recipe, and the loop continues.

## The Hidden Difficulty: Goodhart’s Law in Natural Language

Constitutional AI sounds cleaner than RLHF, but it inherits a classic optimization problem: **Goodhart’s Law**. Once a measure becomes a target, it stops being a good measure.

If you optimize too hard against constitutional preferences, the model may learn to satisfy the **letter** of the principle while missing the spirit. It may become preachy, repetitive, or weirdly accusatory. It may wrap every answer in safety boilerplate because that pattern reliably scores well.

Anthropic reported exactly this kind of issue. One fix was to include principles discouraging overreaction and excessive moralizing. Another was to soften the evaluator’s certainty rather than forcing hard binary judgments. That is an important subtlety. A safety system that acts certain in ambiguous cases often becomes brittle.

Again, the legal analogy helps. A constitution is useful, but courts still need interpretation, precedent, and proportionality. A model that applies every principle as if it were absolute becomes a fanatic, not a good assistant.

## Whose Constitution Is It, Anyway?

Here the technical story spills into political philosophy.

Anthropic’s original constitution was written by Anthropic. That is more transparent than hidden reward-model norms, but it still centers one company’s judgment. To push further, Anthropic later worked with the **Collective Intelligence Project** on **Collective Constitutional AI**, gathering public input from roughly **1,000 Americans** to create a more democratically sourced constitution.

The result was not just symbolic. Anthropic reported that the “public” constitution produced **lower bias scores across all nine measured social dimensions** than the standard researcher-written constitution, with especially notable improvements for **Disability Status** and **Physical Appearance**. The public constitution also emphasized accessibility more strongly.

That is a fascinating result. It suggests that the design of safety principles measurably changes model behavior, and that broader participation can produce different tradeoffs than expert-only drafting.

But it also sharpens the hard question. If a model is used in São Paulo, Istanbul, Delhi, Lagos, and Berlin, why should a constitution written by a thousand Americans govern all of them? On the other hand, if every country, company, or platform writes its own constitution, do we get a fragmented world of incompatible AIs with different moral grammars?

In other words, Constitutional AI did not solve the values problem. It made the values problem impossible to ignore.

## What Today’s Safety Stacks Actually Do

No serious frontier lab now relies on one safety method alone.

Anthropic’s Claude family, OpenAI’s GPT-4-era systems, and Google’s Gemini models all use layered defenses: pretraining choices, supervised fine-tuning, preference optimization, constitutions or policy rules, system prompts, input classifiers, output classifiers, red-team evaluations, monitoring, and post-deployment updates. Safety is now an **ensemble problem**.

That is partly because model capabilities keep moving. A rule or preference scheme that worked for a 13B model may break at 70B. A harmlessness technique tuned on short dialogue may fail on long-context agents with tools. A model that is safe in direct Q&A may become dangerous when allowed to browse the web, write code, and execute plans.

And the costs are no longer academic. Training a frontier model can cost tens or hundreds of millions of dollars; deploying one at scale can burn millions per day in inference. A safety failure is not just a PR problem. It is a governance problem, a liability problem, sometimes even a national-security problem.

## The Big Idea Behind Constitutional AI

Strip away the implementation details and one big idea remains.

**Alignment should be inspectable.**

That may turn out to be Constitutional AI’s most important contribution. Not critique-revision loops. Not RLAIF. Not the exact wording of Claude’s constitution. The lasting contribution may be the insistence that if we are going to build systems that mediate knowledge, advice, and decisions for billions of people, then the values guiding those systems should not live only as ghostly statistical residue inside a reward model.

They should be written down.

That does not make them neutral. It does not make them universally legitimate. But it gives humans something precious: a handle. Something to audit, debate, revise, and compare.

In the long run, this may be how AI safety starts to resemble other mature institutions. Airplanes have checklists. Democracies have constitutions. Financial systems have accounting standards. High-stakes systems become trustworthy not because they are perfect, but because their operating principles are explicit enough to be inspected and challenged.

Large language models are nowhere near that level of maturity. But Constitutional AI points in that direction.

And tomorrow, we’ll move from written constitutions to a different kind of steering signal: the prompt itself. Because the next mystery is almost as strange as self-critique — why a handful of examples in a context window can dramatically change a model’s behavior. **Day 13 is about prompt engineering and in-context learning: why examples work, why chain-of-thought changed everything, and why “prompting” may be a crude early form of programming minds made of text.**

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Time

Test your understanding of Constitutional AI with today's quiz:

<a href="quizzes/day-12.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 12 Quiz →</a>

</div>
