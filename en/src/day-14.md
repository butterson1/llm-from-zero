# Day 14: Emergent Abilities — Chain-of-Thought, Tool Use, and What Nobody Predicted

*The strangest thing about large language models isn't what we designed them to do — it's what they learned to do on their own. And the fiercest debate in AI right now is whether that "learning" is even real.*

---

## The Discovery That Shook the Field

In January 2022, Jason Wei and a team of researchers at Google Brain published a paper that would spark one of the most fascinating arguments in modern AI. The paper, "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," demonstrated something that felt almost magical: if you simply showed a large language model a few examples of step-by-step reasoning before asking it a question, it could suddenly solve math problems, logic puzzles, and multi-step reasoning tasks that had previously been beyond its reach.

Here's what made this so surprising. Nobody trained the model to reason step by step. Nobody added a "reasoning module." Nobody changed a single weight. All Wei and colleagues did was change the *prompt* — the text fed to the model before the question. Instead of showing the model examples like "Q: Roger has 5 tennis balls. He buys 2 more cans of 3. How many does he have? A: 11," they showed examples that included the intermediate steps: "Q: Roger has 5 tennis balls. He buys 2 more cans of 3. That is 2 × 3 = 6 tennis balls. 5 + 6 = 11. A: 11."

The results were dramatic. On the GSM8K benchmark — a set of grade-school math word problems that has become a standard test of mathematical reasoning — PaLM 540B (Google's 540 billion parameter model) went from 17.9% accuracy with standard prompting to 56.9% with chain-of-thought prompting. That's not a marginal improvement. That's the difference between an F and a passing grade, unlocked by changing nothing but the prompt.

But here's the part that really got people's attention: **chain-of-thought only works at sufficient scale.** When Wei and colleagues tried the same technique on smaller models — PaLM 8B, PaLM 62B — the step-by-step prompting actually *hurt* performance. The small models would produce garbled reasoning chains and arrive at worse answers than if they'd just guessed directly. It was only above roughly 100 billion parameters that the technique suddenly "turned on," with performance jumping sharply. Below a critical model size: useless. Above it: transformative.

This pattern — abilities that seem to appear suddenly at scale, absent in smaller models and present in larger ones — is what Wei and colleagues named **emergent abilities**, borrowing a term from physics where complex system-level behaviors "emerge" from simple component-level rules. Water molecules don't individually exhibit wetness. Neurons don't individually exhibit consciousness. And, the argument goes, small language models don't individually exhibit reasoning — until they do.

## The Catalog of Surprises

The emergent abilities paper wasn't just about chain-of-thought. Wei and colleagues surveyed the BIG-bench benchmark suite — a collaborative project involving over 450 researchers who contributed 204 diverse tasks designed to probe language model capabilities — and found emergence everywhere.

**Multi-step arithmetic** was perhaps the most striking. GPT-3's 175 billion parameters could handle 2-digit addition with reasonable accuracy, but 3-digit addition was essentially at chance. Yet future, larger models started cracking multi-digit operations without being specifically trained for them.

**Word unscrambling** showed a similar cliff. Models below a certain scale performed at random on tasks like decoding "ehlol" → "hello." Above that scale, they suddenly could.

**International Olympiad problems** — tasks requiring sophisticated mathematical reasoning — showed flat-at-zero performance for model after model, until a sufficiently large one cracked the pattern.

**Persian QA, Bengali translation, logical deduction** — the paper documented over a dozen tasks that exhibited this phase-transition behavior. The common pattern: performance flat near zero across multiple model scales, then a sudden jump.

And then came the abilities nobody even thought to test for. Researchers at Google discovered that PaLM 540B could explain why a joke was funny — parsing the social expectations, the setup, the subversion. It could identify logical fallacies in arguments. It could generate analogies that mapped structural relationships across domains. None of these were training objectives. None were optimized for. They just... appeared.

## Zero-Shot Chain-of-Thought: The Five-Word Revolution

If Wei's chain-of-thought prompting was surprising, what came next was downright eerie. In May 2022, Takeshi Kojima and colleagues at the University of Tokyo published "Large Language Models are Zero-Shot Reasoners," showing that you didn't even need to provide examples of step-by-step reasoning. You could simply append five words to any question: **"Let's think step by step."**

That's it. No examples. No careful prompt engineering. Just a casual invitation to think out loud.

On the MultiArith benchmark, this trivial addition boosted accuracy from 17.7% to 78.7% — a 4.4× improvement from five words. On GSM8K, it jumped from 10.4% to 40.7%. Kojima's team tested a variety of phrasings ("Let's work this out in a step by step way to be sure we have the right answer," "First, let's think about this carefully," etc.) and found that while the exact wording mattered somewhat, the general pattern was robust: asking the model to show its work unlocked latent reasoning capabilities.

This raised a genuinely deep question: if the capability was "in there" all along, what does it mean that it needed a particular prompt to come out? It's as if you discovered that your calculator could solve differential equations — but only if you said "please" first.

The emerging scientific picture is that chain-of-thought prompting works because it changes the *computational path* through the model. A transformer generates tokens left-to-right, and each token depends on all previous tokens. When a model writes "First, I need to find the total cost of 3 items at $4.50 each: 3 × 4.50 = 13.50," those intermediate tokens become part of the context for generating the final answer. The model is, in effect, using its own output as a scratchpad — a form of external working memory that extends its effective computational depth far beyond what a single forward pass could achieve.

Think of it this way: a transformer's forward pass has a fixed depth (the number of layers — 96 for GPT-4-scale models). Without chain-of-thought, the model must solve the entire problem in that fixed number of computational steps. With chain-of-thought, it gets to make *multiple* forward passes, each building on the previous output. A 96-layer model generating a 20-token reasoning chain effectively gets 96 × 20 = 1,920 layers of computation to work with. It's turning serial depth into parallel breadth.

## Self-Consistency and the Wisdom of Crowds

Wei and colleagues didn't stop at basic chain-of-thought. In a follow-up paper, Xuezhi Wang, Jason Wei, and others at Google introduced **self-consistency** — a technique that samples multiple reasoning chains for the same question and takes a majority vote on the final answer.

The intuition is elegant: if a problem has a correct answer, different valid reasoning paths should converge on it, while errors in reasoning tend to be random and uncorrelated. By sampling, say, 40 different reasoning chains and picking the answer that appears most often, you filter out the noise.

Self-consistency boosted PaLM 540B on GSM8K from 56.9% (chain-of-thought alone) to 74.4%. On the StrategyQA commonsense reasoning benchmark, it pushed accuracy from 75.6% to 81.6%. The technique is computationally expensive — you're running inference 40 times instead of once — but it demonstrates something profound about what's happening inside these models: the "knowledge" for correct reasoning exists as a probability distribution across many possible reasoning paths, and no single sample reliably captures it.

## Tool Use: When Models Learn to Pick Up a Phone

Perhaps the most practically consequential emergent behavior is tool use — the ability of language models to recognize when they need external help and to formulate the right "call" to get it.

In February 2023, Timo Schick and colleagues at Meta AI published **Toolformer**, a paper that demonstrated language models could teach *themselves* to use tools. The approach was clever: they started with a 6.7 billion parameter GPT-J model, annotated training examples with API calls (to a calculator, a search engine, a translation system, a calendar, and a QA system), and then trained the model only on examples where the API call actually *improved* the model's predictions. The model learned to insert API calls mid-sentence — for instance, generating text like "The population of Paris is [QA('population of Paris')] 2.1 million" — and to integrate the returned results into its output.

But Toolformer was a training-time intervention. What's more striking is that sufficiently large models exhibit tool-use behavior *without* any tool-specific training, through pure in-context learning. Give GPT-4 or Claude access to a code interpreter and describe how to call it, and the model will spontaneously decide when a calculation is too complex for mental math, write code to solve it, parse the output, and incorporate the result into its response. Nobody trained it to do this. The behavior arises from the model's understanding of text patterns that describe tool use — because its training data included countless examples of humans describing how they use calculators, search engines, and APIs.

The ReAct framework, introduced by Shunyu Yao and colleagues at Princeton in October 2022, formalized this into a **Reasoning + Acting** loop. Instead of generating a final answer in one shot, the model alternates between "Thought" steps (reasoning about what to do) and "Action" steps (calling external tools), incorporating "Observation" results before continuing. On the HotpotQA benchmark, which requires combining information from multiple Wikipedia articles, ReAct with a search tool outperformed pure chain-of-thought by significant margins — not because the model reasoned better, but because it knew when to *stop* reasoning and go look something up.

This is a qualitative shift. A language model with tool use is no longer a static knowledge base queried at inference time. It's an *agent* — something that can perceive, plan, act, and adapt. And this behavior emerged from training on text.

## The Mirage Debate: Are Emergent Abilities Real?

In April 2023, Rylan Schaeffer, Brando Miranda, and Sanmi Koyejo at Stanford dropped a bomb on the emergence narrative with "Are Emergent Abilities of Large Language Models a Mirage?" The paper, which won a NeurIPS 2023 Outstanding Paper award, argued that the apparent sudden appearance of abilities was an artifact of how researchers chose to *measure* performance, not a genuine property of the models.

Their argument is technical but devastating. Most emergence claims rely on **nonlinear metrics** — measurements that don't scale smoothly with underlying ability. Exact-match accuracy is the prime example: if a model needs to produce "Ottawa" to correctly answer "What is the capital of Canada?", then a model that outputs "Ottaw" scores 0, and a model that outputs "Ottawa" scores 1. There's no partial credit. 

Schaeffer and colleagues showed mathematically that if you have a metric with such a sharp threshold and an underlying capability that improves *smoothly* and *gradually* with scale, you'll observe exactly the "sudden emergence" pattern that Wei reported. Imagine a model's probability of getting each character right increases linearly from 80% to 99.5% as you scale from 1B to 500B parameters. For a 6-character answer like "Ottawa," the probability of getting *all* characters right goes from 0.80⁶ ≈ 26% to 0.995⁶ ≈ 97%. Plot exact-match accuracy against scale, and you'll see what looks like a sudden jump — even though the underlying improvement was perfectly gradual.

To prove their point, they showed that when you replace exact-match accuracy with a **linear metric** like token-level edit distance (measuring how close the model got), the "emergence" vanishes. Performance improves smoothly and predictably across all scales. The phase transition was in the *measurement*, not the model.

This was a genuinely important insight, and it recalibrated the field. But it didn't settle the debate entirely. Critics pointed out several limitations:

First, some emergent behaviors are hard to reduce to linear metrics. How do you assign "partial credit" for explaining a joke? For generating a valid Python program? For correctly applying a logical rule? Some tasks genuinely have a discrete success criterion.

Second, chain-of-thought prompting's scale dependence remains hard to explain as a metric artifact. Small models don't just *underperform* with chain-of-thought — they get actively *worse*. Their reasoning chains are incoherent, introducing errors rather than solving problems. Something qualitative changes in the model's internal representation of multi-step reasoning at scale.

Third, even if individual capabilities improve smoothly, the *composition* of capabilities might not. A model that's 90% good at parsing syntax, 90% good at retrieving facts, and 90% good at logical inference will only succeed at tasks requiring all three about 73% of the time (0.9³). The composed capability can exhibit sharp thresholds even when components improve gradually.

The current scientific consensus, such as it exists, is probably this: "emergence" as a mystical phase transition has been debunked, but *scale-dependent capability thresholds* are real and practically important. The truth is more mundane but no less fascinating than the original hype suggested.

## The Surprising Science of What Models Know But Can't Show

Here's the most counterintuitive finding in this entire space, and it's one that both sides of the emergence debate agree on: **models know more than they can demonstrate in a single forward pass.**

This has been shown in multiple ways. Probing studies — where researchers train small classifiers on a model's internal representations — consistently find that models encode information they can't express in their outputs. A model might have a clear internal representation of whether a mathematical statement is true or false, yet still produce the wrong answer when asked directly.

Kenneth Li and colleagues at Harvard showed in 2023 that language models trained to play Othello develop an internal representation of the actual board state — a genuine world model — even though they were only trained on sequences of moves with no visual input. The model "knows" where the pieces are. But extracting that knowledge requires prompting the model through a specific computational path.

This is what makes chain-of-thought so profound. It's not teaching the model something new. It's giving the model a *format* in which to express knowledge it already possesses. The reasoning chains are scaffolding that allows the model's internal representations to be computed, compared, and combined across multiple generation steps. Without the scaffolding, the knowledge is there but inaccessible — like a library with no card catalog.

## Tool Use in the Wild: From Theory to Production

The theory is fascinating, but the practical impact has been extraordinary. By 2024-2025, tool use had gone from a research curiosity to the backbone of production AI systems.

OpenAI's function calling API, launched in June 2023, formalized the pattern: developers define tools as JSON schemas, and the model decides when to call them, with what arguments, and how to incorporate the results. Claude, Gemini, and open-source models like Llama followed with their own implementations.

The results have been transformative. GitHub Copilot doesn't just complete code — it runs tests, reads documentation, and iterates on errors. AI assistants book flights, search databases, control smart homes, and write-then-execute code, all through the same mechanism: a language model deciding, token by token, that the next thing to generate is a tool call rather than a word.

What's remarkable is how *natural* this feels to the models. Tool use isn't a bolted-on capability — it flows from the same next-token prediction that generates poetry and code. The model treats "[SEARCH('quantum entanglement')]" as just another sequence of tokens to generate, one that happens to trigger an external system. The boundary between "thinking" and "acting" dissolves into a unified token stream.

## What This Means

The emergent abilities story — whether you believe it's genuine phase transitions or smooth scaling with threshold effects — carries a practical lesson that towers above the theoretical debate: **we don't fully know what these models can do.**

Every few months, someone discovers a new prompting technique, a new way to compose capabilities, or a new task that models handle surprisingly well (or surprisingly poorly). Tree-of-thought prompting, graph-of-thought, skeleton-of-thought — each extracts different capabilities from the same frozen weights. The model is a fixed object, but the *interface* to it is still being explored.

This means that benchmarks systematically underestimate model capabilities. The GSM8K score for a given model is not "how good this model is at math." It's "how good this model is at math *given this particular prompting strategy.*" Change the strategy and you change the score, sometimes dramatically.

It also means that the gap between what models can do in principle and what they do in practice is enormous — and closing that gap is as important as building bigger models. Test-time compute scaling, reasoning tokens, and extended thinking are all variations on this theme: giving models more computational runway to express what they already know.

## Tomorrow's Preview

Today we explored the strange things that happen when models get big enough — abilities that emerge, tools that get wielded, reasoning that unfolds. Tomorrow, we zoom in on the most commercially successful story in this space: the **GPT series, from GPT-1 to GPT-4**. We'll trace how OpenAI made one big bet — that scaling up a simple autoregressive language model would yield increasingly powerful AI — and watched that bet pay off in ways that reshaped the entire technology industry. It's the story of a 117-million-parameter experiment that grew into a multi-hundred-billion-dollar company.

---

## 📝 Quiz Time

Test your understanding of emergent abilities, chain-of-thought reasoning, and tool use with today's quiz:

<a href="quizzes/day-14.toml" class="quiz-link" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e94560; color: white; border-radius: 4px; text-decoration: none;">Take the Day 14 Quiz →</a>

</div>
