# Day 13: Prompt Engineering vs In-Context Learning — Why Examples Work

*How a trick that nobody designed, nobody fully understands, and nobody predicted became the most important practical skill in modern AI — and what it reveals about what's really happening inside a transformer.*

---

In January 2020, a team at OpenAI showed GPT-3 a few examples of English sentences translated into French, then gave it a new English sentence. The model translated it correctly. Nobody had fine-tuned the model for translation. Nobody had shown it a single parallel corpus during the demonstration. The model simply inferred, from a handful of examples stuffed into the prompt, what it was supposed to do.

Tom Brown and his co-authors, in the landmark **GPT-3 paper** ("Language Models are Few-Shot Learners"), gave this phenomenon a name: **in-context learning**. They didn't really explain why it worked. Five years later, we still don't fully agree. But this accidental discovery has become arguably more consequential to everyday AI usage than any architectural innovation since the transformer itself. Every time you write a carefully worded ChatGPT prompt, every time a developer builds a system message with example outputs, every time someone complains that "AI can't follow instructions" — they are grappling with in-context learning and its limits.

Here's the counterintuitive part: **the model's weights don't change.** Not a single parameter is updated when you show GPT-4 five examples of how to format a JSON response. The 1.8 trillion parameters (rumored for GPT-4's mixture-of-experts architecture) remain frozen. Whatever happens when the model "learns" from your examples is happening entirely in the forward pass — in the transient flow of activations through attention heads and feed-forward layers. It's less like studying for an exam and more like a chess grandmaster glancing at a board position and instantly seeing the pattern.

Understanding how and why this works is the key to understanding prompt engineering — not as a bag of tricks, but as a genuine interface to a new kind of computation.

## The Spectrum: Zero-Shot, Few-Shot, Many-Shot

The GPT-3 paper established a taxonomy that has become standard vocabulary. **Zero-shot** means you give the model only instructions — "Translate the following English sentence to French" — with no examples. **Few-shot** means you provide a handful of input-output pairs before your actual query, typically 2 to 32 examples. **One-shot** is the minimalist version: a single example.

The results were striking and scaled with model size in a way that defied expectations. On the SuperGLUE benchmark, GPT-3's **175 billion parameter** version achieved an average score of **71.8** in the few-shot setting — competitive with fine-tuned BERT-Large (**340 million parameters**). But GPT-3-Small, at just **125 million parameters**, scored a miserable **42.3** with the same few-shot examples. The ability to learn from context wasn't just a property of the architecture; it was an **emergent capability** that appeared only at sufficient scale.

This is worth pausing on. A 125M parameter model and a 175B parameter model have the same architecture. They see the same few-shot examples in the prompt. But only the large model can actually use those examples. Something happens during pre-training at scale — some internal representational capacity — that enables the model to dynamically adapt its behavior based on prompt context. Smaller models just... don't develop this ability.

The GPT-3 paper tested across **42 benchmarks**, and the pattern was consistent: few-shot prompting closed the gap between frozen models and fine-tuned specialists. On the TriviaQA benchmark, few-shot GPT-3 hit **71.2%** accuracy — surpassing the fine-tuned state-of-the-art at the time (**68.0%**). Translation, arithmetic, unscrambling words, SAT analogies — give the model a few examples, and it would figure out the pattern.

## What's Actually Happening Inside?

This is where things get genuinely fascinating and genuinely contested. If the weights don't change, what mechanism allows a transformer to "learn" from examples in the context window?

The most influential theoretical framework comes from a 2022 paper by Akyürek, Schuurmans, Andreas, Ma, and Zhou at MIT and Google: **"What Learning Algorithm Is In-Context Learning? Investigations with Linear Models."** They showed something remarkable: transformers performing in-context learning on linear regression tasks are implementing, internally, something that closely resembles **gradient descent on an implicit model**. The attention layers are effectively constructing a temporary, ephemeral "model within the model" — using the examples to set up a kind of least-squares fit across the context window.

Think of it this way. During pre-training, the transformer learns billions of parameter configurations that encode knowledge about language, facts, and reasoning patterns. Those parameters are fixed at inference time. But the attention mechanism gives the model a second, dynamic computational channel. When you put examples into the context, each attention head can use those examples to construct temporary routing patterns — effectively building a task-specific circuit on the fly.

A complementary perspective comes from Olsson, Elhage, Neel Nanda, and colleagues at Anthropic, whose 2022 paper **"In-Context Learning and Induction Heads"** identified a specific mechanism they called **induction heads**. These are pairs of attention heads that implement a remarkably simple but powerful algorithm: head A looks at the current token, searches backward in the context for a previous occurrence of that token, and head B then copies whatever token came *after* that previous occurrence. It's pattern completion at the level of attention circuits.

Induction heads emerge during a phase transition in training that Anthropic observed between **1 billion and 10 billion tokens** of training data. Before this transition, models cannot do in-context learning. After it, they can. The transition is sharp, occurring over a narrow window of training steps, and it corresponds to a measurable drop in loss specifically on tokens that require contextual pattern-matching. Anthropic called this a **"phase change"** — a genuine qualitative shift in model capability.

But induction heads are just the foundation. Dai, Sun, Dong, and colleagues at Microsoft Research showed in 2023 that in-context learning in larger models goes beyond simple pattern completion. Their paper, **"Why Can GPT Learn In-Context?"**, demonstrated that the attention mechanism computes something functionally equivalent to **meta-gradients** — the model is effectively doing a form of implicit fine-tuning within the forward pass, without ever modifying a weight.

So what's actually happening? The best current synthesis is: **transformers are meta-learners.** Pre-training doesn't just teach the model facts and patterns. It teaches the model how to learn from examples. The attention mechanism provides the computational substrate for this on-the-fly learning, and the model uses it to construct temporary task-specific computations. It's not learning in the traditional ML sense (no parameter updates), but it's not *not* learning either. It's a third thing — a kind of computational adaptation that we didn't really have vocabulary for before transformers.

## The Rise of Prompt Engineering

If in-context learning is the scientific phenomenon, prompt engineering is its applied cousin — the craft of constructing inputs that reliably elicit the behavior you want.

The term "prompt engineering" initially had a slightly dismissive connotation, as if writing good prompts was a minor UX detail. That attitude evaporated fast. By 2023, prompt engineers at major tech companies were commanding salaries of **$200,000 to $375,000** per year. Anthropic, Google DeepMind, and OpenAI all had internal prompt engineering teams. The craft had become a discipline.

What makes it a discipline rather than guesswork? Several systematic techniques have emerged, each validated by empirical research:

**Chain-of-thought (CoT) prompting.** In January 2022, Jason Wei and colleagues at Google Brain published a paper that shifted the field: **"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models."** The technique is disarmingly simple — you add "Let's think step by step" to your prompt, or include examples where the reasoning steps are shown explicitly. The results were anything but simple. On the GSM8K grade-school math benchmark, standard few-shot prompting with PaLM (540B parameters) achieved **56.5%** accuracy. Adding chain-of-thought examples boosted that to **74.4%**. That's a **17.9 percentage point jump** from a change in the prompt text alone.

Even more surprising: Kojima et al. at the University of Tokyo showed that even zero-shot chain-of-thought worked. Just appending "Let's think step by step" — with no examples at all — improved GSM8K performance from **17.7%** to **58.1%** with InstructGPT (175B). Five words. A 40-point improvement. If you take one thing from this lesson, let it be a sense of wonder at how profoundly the format of a question can change the quality of an answer when addressed to a sufficiently capable model.

**Self-consistency decoding.** Xuezhi Wang and colleagues at Google proposed sampling multiple chain-of-thought reasoning paths and taking a majority vote on the final answer. On GSM8K with PaLM-540B, this pushed accuracy from **74.4%** (single CoT) to **83.0%**. The insight is that reasoning paths can be noisy, but errors tend to be random while correct reasoning converges.

**Role and persona prompting.** When you tell a model "You are an expert tax attorney," you're not just roleplaying. You're shifting the model's attention toward the regions of its parameter space that encode tax-law-adjacent text. Research by Salewski et al. (2023) found that assigning expert roles improved performance by **3-8%** across multiple benchmarks compared to neutral prompting. The model has internalized the statistical patterns of how experts write differently from novices, and the role prompt activates those patterns.

**Structured output prompting.** Showing the model the exact format you want — a JSON schema, a table structure, a specific header pattern — dramatically improves format compliance. This is in-context learning at its most literal: you demonstrate the pattern, and the autoregressive generation process extends it.

## The Surprising Fragility

Here's where prompt engineering reveals its uncomfortable side. The relationship between prompt wording and model output is shockingly fragile in ways that undermine any claim that we truly understand what's going on.

Lu, Bartolo, Moore, Riedel, and Stenetorp (2022) showed that **the order of few-shot examples** can swing accuracy by as much as **30 percentage points** on some tasks. Present the same examples in a different sequence, and a model that was getting 90% might drop to 60%. This sensitivity has no obvious explanation — a human reading those examples in any order would extract the same information.

Zhao, Wallace, Feng, Klein, and Singh (2021) documented three systematic biases in few-shot learning. **Majority label bias:** if three of your four examples have a "positive" label, the model will skew toward "positive" for the test input. **Recency bias:** the model pays disproportionate attention to examples near the end of the context. **Common token bias:** the model prefers to output tokens that appear frequently in pre-training, regardless of what the examples demonstrate.

Webson and Pavlick (2022) at Brown University delivered perhaps the most unsettling finding: they showed that **irrelevant and even misleading prompt templates** can sometimes produce results nearly as good as well-crafted ones. On some NLI tasks, a prompt template that said "does the previous passage contain the answer to this question?" — which is semantically wrong for the task — performed within a few percentage points of the correct template. The model seemed to be responding more to the structural format of the prompt than to its semantic content.

This suggests that a significant portion of what prompt engineering achieves may be less about communicating intent to the model and more about activating pre-existing circuits through surface-level pattern matching. The model isn't reading your prompt the way a human reads instructions. It's using your prompt as a key to unlock pre-trained behavioral modes.

## System Messages and the Instruction Hierarchy

Modern API-based models add another layer to the prompting story: the **system message**. OpenAI introduced system messages with the ChatGPT API in March 2023, and every major provider followed. The system message sits at the beginning of the context and sets persistent behavioral constraints — persona, output format, safety boundaries, tool use instructions.

But system messages are not privileged in any architectural sense. They're just text at the beginning of the context window. A 2023 study by Perez and Ribeiro found that **prompt injection attacks** — where user input contains instructions that override the system message — succeeded against GPT-4 roughly **24%** of the time with basic techniques, and could reach much higher rates with sophisticated jailbreaks.

This led to work on **instruction hierarchy**. OpenAI's 2024 paper on the topic proposed training models to explicitly distinguish between system-level and user-level instructions, with the system message taking precedence. Claude's system prompt handling takes a similar approach. But the fundamental tension remains: from the transformer's perspective, all tokens in the context window are just tokens, and any attempt to create privilege levels is an overlay on top of the flat attention mechanism.

## Many-Shot In-Context Learning: The Long-Context Revolution

The expansion of context windows — from GPT-3's 2,048 tokens to GPT-4 Turbo's 128,000 to Gemini 1.5 Pro's 1 million and Claude 3's 200,000 — has opened a new frontier: **many-shot in-context learning**.

Agarwal, Singh, Zhang, and colleagues at Google DeepMind published a striking paper in April 2024: **"Many-Shot In-Context Learning."** Using Gemini 1.5 Pro's million-token context, they demonstrated that performance continues to improve with hundreds or even thousands of examples — far beyond the diminishing returns you'd expect. On the MATH benchmark, going from 3-shot to **125-shot** improved Gemini 1.5 Pro's accuracy from **56.4%** to **71.8%** — a 15.4 percentage point gain purely from adding more examples to the context.

This challenges the conventional wisdom that few-shot learning plateaus at 5-10 examples. With enough context, the in-context learning mechanism keeps extracting useful signal. The model is building an increasingly refined implicit model of the task, example by example.

Even more intriguingly, the paper showed that many-shot ICL can **overcome pre-training biases**. On tasks where the model had a strong default behavior from pre-training, a few examples weren't enough to override it, but hundreds of examples were. The in-context signal, given sufficient volume, can overpower the static signal in the weights.

## The Meta-Learning Interpretation

Step back, and a unifying picture emerges. Pre-training creates a model that has learned not just language, but **how to learn from demonstrations**. The attention mechanism is the substrate for this meta-learning. Few-shot examples in the prompt are training data for an implicit, ephemeral learning algorithm that runs in the forward pass.

This explains several puzzling observations. It explains why scale matters: meta-learning requires enormous representational capacity that small models don't have. It explains why example ordering matters: the model is processing examples sequentially, and its "implicit learning algorithm" is sensitive to presentation order just like real gradient descent can be sensitive to mini-batch ordering. It explains why chain-of-thought works: by generating intermediate reasoning steps, the model creates additional "context" for itself, effectively giving its implicit learning algorithm more signal to work with.

And it explains the most magical-seeming property of all: **you can get a frozen model to do things it has never been explicitly trained to do, by showing it what you want.** Not because the model understands your intent in any deep sense, but because its meta-learning circuitry can construct novel computations from demonstrated patterns.

## The Practical Upshot

Prompt engineering, stripped of mysticism, is the skill of constructing inputs that reliably activate the right meta-learned circuits. The best practitioners understand several principles:

**Be specific about format.** The model's in-context learning is heavily format-driven. Showing the exact output structure you want is worth more than paragraphs of description.

**Provide diverse examples.** Examples that cover edge cases help the implicit learning algorithm generalize. Repetitive examples waste context tokens.

**Put important instructions at the beginning and end of prompts.** The model's attention has measurable primacy and recency biases — information in the middle of long contexts gets less attention (the "lost in the middle" phenomenon documented by Liu, Lin, Hewitt, Paranjape, Bevilacqua, Petroni, and Liang in 2023).

**Use chain-of-thought for reasoning tasks.** This is not a hack; it's giving the model more computational steps to work with. Autoregressive models can only do O(1) computation per output token; chain-of-thought effectively lets you trade output tokens for computational depth.

**Iterate empirically.** Because the relationship between prompt text and model behavior is not fully understood, prompt engineering remains partly an empirical discipline. Small changes can have outsized effects, and the only way to know is to test.

## Tomorrow's Connection

Today we explored what happens when you give a model examples at inference time, without changing its weights. Tomorrow, we step into genuinely strange territory: **emergent abilities**. Chain-of-thought prompting is itself one of the most famous examples of emergence — a capability that appears suddenly above a certain model scale, seemingly from nowhere. We'll examine what "emergence" actually means (and whether it's even real), why models suddenly develop abilities like multi-step arithmetic and analogical reasoning, and the fierce debate over whether these capabilities are genuinely discontinuous or just smooth improvements that cross a measurement threshold. If today's lesson was about what you can coax a model to do, tomorrow's is about what models learn to do all by themselves.

---

## 📝 Quiz Time

Test your understanding of prompt engineering and in-context learning with today's quiz:

<a href="quizzes/day-13.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 13 Quiz →</a>

</div>
