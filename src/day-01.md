# Day 1: What Is a Language Model?

*From counting word pairs in 1948 to predicting the future of human language — the unlikely journey of machines that learned to talk.*

---

## The Most Important Equation You've Never Heard Of

Here's a question that sounds trivial until you really think about it: given the words "The cat sat on the ___," what comes next?

You probably said "mat." Maybe "floor" or "couch." Your brain didn't just retrieve a memorized answer — it computed a *probability distribution* over every possible English word, weighed them against your experience with language, and surfaced the most likely candidates. You did this in milliseconds, without conscious effort.

A **language model** is a system that does the same thing, mathematically. It assigns probabilities to sequences of words — or more precisely, to the next token given all the tokens that came before it. That's it. That's the whole idea. Every chatbot you've talked to, every AI that writes code or poetry or legal briefs, is at its core just a very sophisticated next-token predictor.

But "just" is doing a lot of heavy lifting in that sentence. The gap between a naive word-counting approach and GPT-4 is like the gap between a paper airplane and a 787 Dreamliner. Both fly. The engineering couldn't be more different.

## Act I: Counting Words (1948–2000)

The story starts with Claude Shannon — yes, *that* Claude Shannon, the father of information theory. In his landmark 1948 paper "A Mathematical Theory of Communication," Shannon proposed something radical: you could model English as a statistical process. Not by understanding grammar or meaning, but by observing patterns in how letters and words follow each other.

Shannon built what we'd now call an **n-gram model**. The idea is beautifully simple. Take a massive pile of text. Count how often each word follows every other word. That gives you a *bigram* model (n=2). Count how often each word follows every *pair* of words, and you have a *trigram* model (n=3). The probability of the next word is just:

> P(word | previous n-1 words) = count(n-gram) / count((n-1)-gram)

If "New York" appears 10,000 times in your corpus and "New York City" appears 3,000 times, then P(City | New York) = 0.3. Easy.

N-gram models dominated natural language processing for decades. Google's Web 1T 5-gram corpus, released in 2006, contained over a trillion tokens from web pages — every sequence of 1 to 5 words that appeared at least 40 times. These models powered spell checkers, machine translation systems, and speech recognition through the 2000s. IBM's statistical machine translation system, which used trigram language models, beat rule-based systems convincingly by the early 2000s.

But n-gram models have a brutal limitation: **the curse of dimensionality**. English has roughly 170,000 words in active use. A bigram model needs to store probabilities for 170,000² ≈ 29 billion word pairs. A trigram model: 170,000³ ≈ 4.9 × 10¹⁵ entries. A 5-gram model? Forget it — even Google's trillion-token corpus left most possible 5-grams with a count of exactly zero.

This is called the **sparsity problem**. Most reasonable sentences contain word sequences that have never appeared in any training corpus, no matter how large. "The quantum physicist devoured her burrito" is a perfectly valid English sentence, but good luck finding it in any corpus. N-gram models assign it probability zero, which is obviously wrong.

Researchers patched this with **smoothing techniques** — Kneser-Ney smoothing, Good-Turing estimation, stupid backoff (yes, that's its actual name, courtesy of Google in 2007). These hacks redistributed probability mass from common n-grams to rare or unseen ones. They worked surprisingly well. But they were band-aids on a fundamental problem: n-gram models treat words as arbitrary symbols with no relationship to each other. The model has no idea that "devoured" and "ate" are related, or that "physicist" and "scientist" share meaning.

## Act II: Teaching Machines That Words Have Meaning (2003–2017)

In 2003, Yoshua Bengio and colleagues at the University of Montreal published a paper that would quietly reshape the field: "A Neural Probabilistic Language Model." The core insight was deceptively simple: what if, instead of treating each word as an isolated symbol, we represented words as *vectors* — points in a continuous mathematical space?

Bengio's model had three components: an embedding layer that mapped each word to a vector of (say) 60 dimensions, a hidden layer that combined the context word vectors, and an output layer that predicted the next word. The embedding vectors weren't hand-designed — they were *learned* during training. Words that appeared in similar contexts gradually drifted toward similar positions in the vector space.

This solved the sparsity problem in one stroke. Even if the model had never seen "The quantum physicist devoured her burrito," it could generalize from "The nuclear physicist ate her sandwich" because "quantum" and "nuclear" would have similar embeddings, as would "devoured"/"ate" and "burrito"/"sandwich."

The model was tiny by modern standards — a vocabulary of maybe 17,000 words, trained on 14 million tokens of text. Training took days on a single machine. But it outperformed the best n-gram models with smoothing on perplexity benchmarks, using orders of magnitude less data.

Bengio's model was a *feedforward* neural network — it looked at a fixed window of previous words (typically 5-10). This meant it couldn't capture long-range dependencies. If the subject of a sentence was 20 words ago, tough luck.

Enter **recurrent neural networks (RNNs)**, and specifically **Long Short-Term Memory (LSTM)** networks, invented by Sepp Hochreiter and Jürgen Schmidhuber in 1997. LSTMs process text one word at a time, maintaining a hidden state — a kind of running summary — that theoretically lets information persist indefinitely. In practice, LSTMs could handle dependencies of maybe 200-300 tokens before the signal degraded.

By 2015-2016, LSTM language models were state of the art. Rafal Jozefowicz and colleagues at Google Brain trained a two-layer LSTM with 8,192 hidden units per layer — about 1.04 billion parameters — on the One Billion Word Benchmark. It achieved a perplexity of 30.0, meaning the model was on average as uncertain as choosing between 30 equally likely next words. For reference, a random-guess model over 800,000 vocabulary items would have perplexity of 800,000. The LSTM was narrowing the field by four orders of magnitude.

But LSTMs had their own Achilles' heel: they were **sequential**. To process word 500, you had to process words 1 through 499 first. You couldn't parallelize across the sequence. This meant training on huge datasets was painfully slow. Google's billion-parameter LSTM took weeks to train on a GPU cluster. There had to be a better way.

## Act III: The Revolution (2017–Present)

There was. In June 2017, a team of eight researchers at Google published "Attention Is All You Need." The paper introduced the **Transformer** architecture, and within two years, it had rendered LSTMs essentially obsolete for language modeling.

We'll dive deep into transformers in Days 3 and 4. For now, here's the key insight: instead of processing words sequentially, the Transformer processes all words in a sequence *simultaneously*, using a mechanism called **self-attention** to let every word "look at" every other word and decide how much to care about it. This is massively parallelizable — you can throw hundreds of GPUs at it and they all stay busy. The speed advantage is transformative (pun intended).

The Transformer unlocked a simple but powerful recipe: take a *very large* neural network, train it on *very large* amounts of text, using next-token prediction as the only objective. GPT-1 (2018) had 117 million parameters and was trained on BookCorpus (about 800 million tokens). GPT-2 (2019) scaled to 1.5 billion parameters and 40GB of web text. GPT-3 (2020) exploded to 175 billion parameters trained on 300 billion tokens, at an estimated cost of $4.6 million in compute.

Each step up the scaling ladder brought qualitative changes in capability that no one had explicitly programmed. GPT-3 could write essays, translate between languages, do arithmetic, write code, and answer trivia questions — all from a model trained *only* to predict the next token. The researchers at OpenAI didn't build a translation module or a math module. They built a better language model, and these abilities *emerged*.

Here's the counterintuitive part that still surprises people: **next-token prediction is not a shallow task**. To predict the next token in a passage about organic chemistry, a model must implicitly learn organic chemistry. To predict the next move in a chess game written in algebraic notation, it must implicitly learn chess strategy. To predict the next line of code, it must implicitly learn programming. The prediction objective is shallow; the knowledge required to do it well is not.

This is sometimes called the **compression hypothesis**: a sufficiently good compressor of text must learn a model of the processes that generated that text. If your training data contains millions of physics textbooks, predicting the next word in physics discussions requires learning physics. The language model becomes, in a sense, a *compressed representation of human knowledge*, filtered through the statistical regularities of how we express that knowledge.

## What "Probability" Actually Looks Like

Let's make this concrete. When a modern language model like Claude or GPT-4 processes the input "The capital of France is," its final layer produces a vector of roughly 100,000-200,000 numbers (one per vocabulary token). These numbers, after applying a softmax function, become probabilities. The output might look something like:

| Token | Probability |
|-------|------------|
| Paris | 0.92 |
| the | 0.03 |
| known | 0.01 |
| located | 0.008 |
| a | 0.005 |
| ... | ... |

The model doesn't "know" that Paris is the capital of France in the way you know it. It has learned that in the vast ocean of training text, "Paris" overwhelmingly follows "The capital of France is." But this statistical learning is deep enough that the distinction between "knowing" and "predicting" starts to blur.

**Temperature** is how we control the randomness of sampling from this distribution. At temperature 0, the model always picks the highest-probability token (greedy decoding). At temperature 1, it samples proportionally to the probabilities. At temperature 2, the distribution flattens — "Paris" might drop to 0.6 while unlikely tokens get boosted. This is why creative writing tasks often use higher temperature (more surprising word choices) while factual tasks use lower temperature (stick to what's most likely).

## Measuring a Language Model: Perplexity

How do you measure whether one language model is better than another? The standard metric is **perplexity**, and it has a beautiful intuition.

Perplexity is 2 raised to the power of the cross-entropy loss. In plain English: perplexity tells you how many equally likely tokens the model is choosing between, on average, at each step. A perplexity of 10 means the model is as uncertain as if it were rolling a 10-sided die at every token. Lower is better.

For context: the best n-gram models on standard benchmarks achieved perplexities around 50-70. LSTM models brought this down to 25-35. Modern Transformer-based models achieve perplexities below 10 on many benchmarks. GPT-4-class models are estimated to have perplexities around 4-6 on web text — meaning they're typically choosing between just 4-6 plausible next tokens. That's astonishingly accurate.

But here's a critical nuance: **perplexity doesn't measure intelligence**. A model that has memorized all of Wikipedia might have excellent perplexity on a Wikipedia test set but fail to answer a novel question. Perplexity measures how well a model predicts text distributions, not how well it reasons, follows instructions, or avoids harmful outputs. This gap between prediction quality and useful behavior is why fine-tuning and alignment (topics we'll cover in Week 2) matter so much.

## The Surprising Power of Scale

Perhaps the most stunning fact about language models is that **scale changes everything**. In 2020, Jared Kaplan and colleagues at OpenAI discovered remarkably clean mathematical relationships between model performance and three variables: parameter count, dataset size, and compute budget. These **scaling laws** (which we'll explore in depth on Day 7) showed that language model loss decreases as a smooth power law with each variable, over many orders of magnitude.

This means performance is *predictable*. If you know how a 1-billion-parameter model performs, you can extrapolate to 100 billion parameters with surprising accuracy. The scaling curves are so clean that OpenAI reportedly used them to predict GPT-4's performance before training even began — a bet worth over $100 million in compute.

As of early 2026, the frontier models (GPT-4.5, Claude 3.5, Gemini Ultra) are estimated to have somewhere between 200 billion and 1.8 trillion parameters, trained on 10-15 trillion tokens of text. Training runs for these models cost $50-200 million in compute alone, take 3-6 months on clusters of 10,000-30,000 GPUs, and consume enough electricity to power a small town for a year.

And yet, at their mathematical core, they're still doing the same thing Claude Shannon described in 1948: predicting what comes next.

---

## Key Takeaways

1. **A language model assigns probabilities to sequences of tokens** — the fundamental task is next-token prediction
2. **N-gram models** counted word sequences but couldn't handle the combinatorial explosion of language
3. **Neural language models** solved sparsity by learning word embeddings in continuous vector spaces
4. **The Transformer** (2017) enabled massive parallelization, unlocking scale that was impossible with RNNs
5. **Predicting the next token well requires deep world knowledge** — the simplicity of the objective belies the complexity of the learning
6. **Perplexity** measures prediction quality but not usefulness or intelligence
7. **Scaling laws** show that bigger models predictably get better, following clean power laws

---

## Tomorrow: The Geometry of Meaning

If language models represent words as vectors, what do those vectors look like? Day 2 dives into **word embeddings** — the discovery that mathematical operations on word vectors capture real semantic relationships. We'll explore why `king - man + woman = queen` isn't just a cute trick but a deep insight into how meaning can be encoded in geometry, and how Word2Vec and GloVe laid the mathematical foundation that modern LLMs still build on.

---

<div id="quiz-day-01"></div>
<script src="../quiz/quiz-embed.iife.js"></script>
<link rel="stylesheet" href="../quiz/style.css">
<script>
QuizEmbed.createQuiz("quiz-day-01", "/quizzes/day-01.toml");
</script>
