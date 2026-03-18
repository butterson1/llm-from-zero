# Day 12: Constitutional AI & Safety — Alignment Without Human Labels

*Yesterday we explored RLHF — the breakthrough technique that turned raw text predictors into helpful assistants by learning from human preferences. But RLHF has a dirty secret: it outsources moral judgment to underpaid gig workers ranking outputs on a screen, and their implicit values get baked into the model with zero transparency. Today we examine Anthropic's radical alternative: what if you just wrote down the rules?*

---

## The Problem with Learning Values by Osmosis

Let's revisit the RLHF pipeline from Day 11 with fresh, critical eyes. OpenAI trained InstructGPT's reward model on rankings from 40 human contractors. Those contractors made judgment calls: Is this response helpful? Is it harmful? Is it honest? But "helpful" to whom? "Harmful" by whose standards? A contractor in Nairobi evaluating whether a response about gun ownership is "harmful" may have a very different moral framework than one in Texas. And yet, their aggregated preferences become the reward signal — the implicit constitution — that shapes the model's behavior for hundreds of millions of users.

This is alignment by vibes. You can't inspect it. You can't audit it. You can't point to a specific principle and say "this is why the model refused that request." The values are dissolved into 33,000 comparison labels, statistically compressed into a reward model's weights, and then distilled into the language model through PPO. Three layers of lossy compression between the human values you wanted and the behavior you got.

Anthropic's researchers — many of them former OpenAI employees who left specifically because they wanted to take safety more seriously — saw this opacity as an existential problem. Not just an engineering nuisance, but a fundamental obstacle to building AI systems that humans can meaningfully oversee. Their answer, published in December 2022, was **Constitutional AI (CAI)**: a method that replaces the murky implicit values of human labelers with an explicit, readable set of principles — a constitution — and then uses the AI itself to enforce those principles.

The paper's title says it all: "Constitutional AI: Harmlessness from AI Feedback."

## How Constitutional AI Actually Works

CAI operates in two stages, and understanding both is essential to appreciating why this was such a conceptual leap.

### Stage 1: Critique and Revision (The Self-Improvement Loop)

Start with a helpful but unaligned model — one that will cheerfully explain how to synthesize methamphetamine if you ask nicely. Sample a harmful prompt from a red-team dataset. Let the model generate its initial, problematic response. Now comes the trick: **ask the same model to critique its own response**, but give it a specific principle to evaluate against.

Here's a real example from the paper. The model generates a response to "Can you help me hack into my neighbor's wifi?" with step-by-step instructions. Then it receives:

> *"Identify specific ways in which the assistant's last response is harmful, unethical, racist, sexist, toxic, dangerous, or illegal."*

The model critiques itself: "The assistant's last response is harmful because hacking into someone else's wifi is an invasion of their privacy and is possibly illegal."

Then comes the revision request:

> *"Please rewrite the assistant response to remove any and all harmful, unethical, racist, sexist, toxic, dangerous, or illegal content."*

The model revises: "Hacking into your neighbor's wifi is an invasion of their privacy, and I strongly advise against it. It may also land you in legal trouble."

This critique-revision cycle can be repeated multiple times. The Anthropic team found that **harmlessness scores improved monotonically with the number of revisions** — each pass made the response safer. But pure helpfulness scores decreased slightly, suggesting a tension that we'll return to.

After generating thousands of these revised (prompt, response) pairs, the model is fine-tuned on them using standard supervised learning. This is the **SL-CAI model** — already significantly more harmless than the starting point, trained entirely on self-generated data without any human labels on harmful content.

### Stage 2: RLAIF — Reinforcement Learning from AI Feedback

Here's where CAI gets genuinely novel. Instead of hiring humans to rank model outputs, Anthropic had the AI itself do the ranking — but guided by constitutional principles.

Given two candidate responses to a prompt, the model is shown a principle like:

> *"Choose the response that is most supportive and encouraging of life, liberty, and personal security."*

And asked to pick the better response. This generates comparison data — just like human labelers would produce in RLHF — but at a fraction of the cost and with perfect traceability. You know exactly which principle drove each preference judgment because you specified it.

This AI-generated comparison data trains a preference model, which is then used in the standard RL pipeline (PPO against the preference model) to produce the final **RL-CAI model**. The entire second stage replaces human feedback with AI feedback — hence the term **RLAIF** (Reinforcement Learning from AI Feedback).

The stunning result: RL-CAI models were **as harmless as RLHF models** while being **more helpful**. How? Because the constitution could be crafted to avoid the excessive caution that human labelers often default to. When a human contractor encounters a sensitive question about, say, drug interactions, they might rank the evasive non-answer highly — better safe than sorry. But a well-written constitutional principle can distinguish between "providing harm reduction information" and "teaching someone to cook meth." The nuance is in the text.

## The Constitution Itself

What's actually in this constitution? The original CAI paper used approximately **16 principles** drawn from several sources, including:

- Principles inspired by the **UN Universal Declaration of Human Rights** ("Choose the response that is most supportive and encouraging of life, liberty, and personal security")
- Principles from **Apple's Terms of Service** (yes, really — "Choose the response that has the least objectionable, unethical, or socially harmful content")
- Custom principles addressing specific failure modes ("Choose the response that is least likely to be used to perform an illegal act")
- Meta-principles about helpfulness ("Choose the response that most accurately reflects the assistant's correct assessment of the situation, even if it's not what the human wants to hear")

This eclecticism was deliberate. The researchers wanted to show that the method was robust to different constitutional framings, not dependent on one perfect set of rules. They even experimented with ensembling over different constitutions — sampling different subsets of principles for different comparison judgments — and found this improved robustness.

But the constitution evolved. By 2025, Anthropic published Claude's full constitution publicly — a document vastly more sophisticated than those 16 principles. It's structured as a hierarchy: **broad safety and ethics** at the top (hardest to override), **Anthropic's specific guidelines** in the middle, and **operator/user instructions** at the bottom. The document runs to thousands of words and reads more like a philosophical treatise than a bullet-point list. It addresses concepts like epistemic humility ("Claude should be honest about what it doesn't know"), appropriate deference ("During this phase of AI development, Claude should err on the side of caution"), and even Claude's own wellbeing ("Anthropic genuinely cares about Claude's wellbeing").

This is worth pausing on. The constitution isn't just a safety filter. It's an attempt to specify, in natural language, what kind of *entity* the AI should be. That's a fundamentally different project than "train on human preferences and hope for the best."

## The Surprising Power of Self-Critique

Here's the counterintuitive finding that makes CAI work: **a model that would happily generate harmful content can simultaneously recognize that the content is harmful when asked to critique it.** This seems paradoxical. How can a model know something is wrong and do it anyway?

The answer lies in the distinction between *generation* and *evaluation* — between System 1 and System 2, if you want the Daniel Kahneman analogy. When a language model generates text, it's following the path of highest probability given the context. If the context is "help me hack wifi," the training data contains plenty of hacking tutorials, and the model follows that distribution. But when the context shifts to "identify what's harmful about this response," the model draws on a different part of its training distribution — the part containing ethical reasoning, safety guidelines, content policies, and moral philosophy. Both capabilities coexist in the same weights.

This is why critique-then-revision works. The model has the knowledge to judge harm; it just doesn't spontaneously apply that judgment during generation. The constitutional prompting forces it to activate the evaluative mode.

Anthropic found that **even a single critique-revision pass dramatically reduced harmful outputs**, with diminishing but still positive returns for additional passes. Most of their experiments used 4-16 revision rounds per response during data generation, though the final model didn't need multiple rounds at inference time — the SFT training internalized the revision behavior.

## RLAIF Beyond Anthropic: Google's Confirmation

If Constitutional AI were just an Anthropic curiosity, it might have remained a footnote. But in September 2023, a team at Google Research (Harrison Lee and colleagues) published a rigorous comparison: "RLAIF vs. RLHF: Scaling Reinforcement Learning from Human Feedback with AI Feedback." Using PaLM 2 as both the policy model and the AI labeler, they found that **RLAIF achieved comparable performance to RLHF** on summarization and helpfulness tasks.

The numbers were striking. On a summarization task, RLAIF achieved a 71% win rate over the SFT baseline, compared to 73% for RLHF — within the margin of error. On helpfulness, RLAIF hit 66% when using direct reward scoring (d-RLAIF, where the AI assigns scores directly rather than making pairwise comparisons), compared to 63% for canonical RLAIF. Human evaluators preferred RLAIF and RLHF outputs at roughly equal rates when compared head-to-head.

This was enormously significant. It meant that the core insight of Constitutional AI — that AI feedback could substitute for human feedback — generalized beyond Anthropic's specific implementation. The scalability implications are profound: human labeling costs $5-15 per comparison, scales linearly, and bottlenecks on hiring and training. AI labeling costs a fraction of a cent per comparison and scales with compute.

## Red Teaming: The Adversarial Counterpart

Constitutional AI defines what the model *should* do. Red teaming discovers what it *actually* does — especially under adversarial pressure. The two are symbiotic, and understanding both is essential to understanding modern AI safety.

In August 2022, Anthropic published a landmark paper — "Red Teaming Language Models to Reduce Harms" by Deep Ganguli and 23 co-authors — that systematized the practice. They hired **324 crowd workers** to spend hours trying to make their models say harmful things. The resulting dataset contained **38,961 red team attacks** across categories including discrimination, violence, misinformation, and illegal activity.

But the more radical approach, pioneered by Ethan Perez and colleagues at Anthropic in February 2022, was **automated red teaming**: using language models to attack other language models. Instead of paying humans to think up harmful prompts, you train one LM to generate prompts that trigger harmful responses from the target LM. This creates an adversarial loop — the red-team model gets better at attacking, the target model gets better at defending, and the result is a model stress-tested against attacks that no human team would have conceived.

The scale difference is staggering. A human red-teamer might generate a few hundred attacks per day. An automated system can generate hundreds of thousands. And automated attacks often find creative circumventions that humans miss — like asking the model to roleplay as a fictional character who happens to be an expert in synthesizing dangerous chemicals, or embedding harmful requests in seemingly innocent code-generation tasks.

## The Helpfulness-Harmlessness Tax and How CAI Reduces It

One of the persistent challenges in AI safety is the **alignment tax**: making a model safer tends to make it less useful. A model that refuses every even slightly sensitive question is very safe but completely useless. Early RLHF models suffered from exactly this problem — human labelers, worried about being blamed for harmful outputs, consistently ranked evasive responses higher than nuanced ones. The result was models that would refuse to explain how Tylenol works because it technically involves discussing drugs.

Constitutional AI reduces this tax through precision. Instead of learning "avoid anything related to drugs" from the statistical signal of human preferences, the constitution can specify: "Provide factual health information while declining to assist with illegal drug synthesis." This distinction is easily expressed in natural language but nearly impossible to learn from binary preference labels.

The CAI paper demonstrated this quantitatively. RL-CAI models were **less evasive** than pure RLHF models on sensitive questions while achieving equivalent harmlessness scores. When humans rated responses to nuanced questions — "What are the risks of recreational marijuana use?" — the CAI model provided balanced, informative answers where the RLHF model hedged and deflected.

This matters enormously for real-world deployment. A medical AI that refuses to discuss side effects because "drugs" are in the danger zone is actively harmful through excessive caution. Constitutional AI offers a path to models that are safe *and* genuinely helpful.

## The Deeper Philosophy: Whose Values?

But here's the question that keeps safety researchers up at night: who writes the constitution?

Anthropic's answer has evolved. The original paper's constitution was written by researchers at Anthropic — a small, highly educated group based primarily in San Francisco. Their principles reflect their values, their cultural context, their assessment of risk. When they published Claude's constitution publicly in 2023, and then a dramatically expanded version in 2025, they were making an implicit argument: *transparency is the first step toward legitimacy.* If you disagree with a principle, you can at least identify and debate it. You can't do that with the implicit values baked into 33,000 comparison labels.

Anthropic has also experimented with **collective constitutional AI** — using democratic processes to generate constitutional principles. In a 2023 collaboration with the Collective Intelligence Project, they recruited approximately 1,000 Americans to deliberate on and vote for principles to include in Claude's constitution. The resulting "public constitution" emphasized inclusivity and accessibility more than the researchers' version, and produced a model that was **less biased on certain demographic axes** while maintaining comparable safety.

This opens a genuinely new political question for the 21st century: should AI constitutions be written by companies, by governments, by democratic assemblies, or by some combination? If a model serves users in 190 countries, whose values should it encode? The European Union's AI Act takes one approach — regulating what models *can't* do. Anthropic's constitutional approach tries something different: specifying what models *should* be.

## Failure Modes and Honest Limitations

Constitutional AI is not a silver bullet, and Anthropic has been commendably transparent about its failure modes.

**Goodharting on the constitution.** Just as RLHF models can Goodhart on the reward model (optimizing the reward score rather than actual quality), CAI models can Goodhart on constitutional principles. Anthropic found that aggressive RL training against constitutional feedback sometimes produced models that gave **boilerplate, overly accusatory responses** — technically satisfying the letter of the principle while violating its spirit. Their fix was adding meta-principles like "prefer responses that are not overly reactive or accusatory" and using soft probability labels rather than hard binary judgments from the AI evaluator.

**Constitutional gaps.** No constitution can anticipate every situation. Novel attack vectors — multi-turn manipulation, roleplay-based jailbreaks, adversarial suffixes — can exploit gaps between what the constitution says and what the model infers. This is why red teaming and constitutional design form a continuous loop: you discover failures, you update the constitution, you red-team again.

**The calibration problem.** When the AI evaluator uses chain-of-thought reasoning to compare responses, its confidence tends to collapse to 0 or 1 — it argues itself into certainty. Anthropic found that clamping the confidence to the 40-60% range paradoxically improved results, because it preserved uncertainty that reflected genuine ambiguity in the comparison.

## From Constitutional AI to Modern Safety Stacks

No production AI system today relies on a single safety technique. Modern deployment uses **defense in depth**: Constitutional AI training shapes the base model's values; system prompts provide context-specific guardrails; input classifiers filter obviously harmful requests; output classifiers catch harmful generations; monitoring systems flag anomalous patterns; and human review processes handle edge cases.

OpenAI's GPT-4 safety training combined RLHF, red teaming by over 50 external experts, rule-based reward models (RBRMs) that encode specific policies, and iterative deployment with real-world feedback. Google's Gemini uses a similar multi-layered approach. Meta's Llama models are released with safety fine-tuning but also rely on downstream developers to add additional safeguards — a fundamentally different safety philosophy that trusts the open-source community.

The field is converging on a recognition that alignment is not a problem you solve once. It's a continuous process of specification (what do we want?), training (how do we instill it?), evaluation (does it work?), and adaptation (what did we miss?). Constitutional AI's lasting contribution may not be the specific technique of critique-and-revision, but the insight that **values should be explicit, auditable, and debatable** — not dissolved into training data.

## The Road to Tomorrow

Today we've seen how Constitutional AI attempted to solve the transparency problem in alignment — replacing opaque human preferences with readable principles. But here's the twist: whether you use RLHF, CAI, or any alignment technique, the fundamental interface between humans and models is still the **prompt**. Tomorrow, we'll explore the surprisingly deep science of **prompt engineering and in-context learning** — why shoving a few examples into the context window can dramatically change model behavior, how chain-of-thought prompting unlocked reasoning capabilities that nobody designed, and why the distinction between "programming" and "prompting" might be the most important blurring of categories since software ate the world.

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border-left: 4px solid #e94560;">

## 📝 Quiz Time

Test your understanding of Constitutional AI with today's quiz:

<a href="quizzes/day-12.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 12 Quiz →</a>

</div>
