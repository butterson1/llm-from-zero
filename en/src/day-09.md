# Day 9: Data — CommonCrawl, The Pile, and the Dirty Secret of Training Data

*Yesterday you saw the machine room: the H100s, the InfiniBand fabric, the 20-megawatt power draw, the 3 a.m. checkpoint recoveries. Today we look at what all that hardware is actually chewing on. This is where large language models stop looking like pure mathematics and start looking like industrial agriculture. The model is the combine harvester. The internet is the field. And the strange truth of modern AI is that the harvest matters at least as much as the machine.*

---

## The Model Learns the World by Eating Its Text Exhaust

A language model is often described as “trained on the internet,” which is like saying a human is raised on “food.” Technically true, almost useless. The real story is not just how much data goes in, but what kinds of text, in what proportions, after what filtering, with what duplicates removed, and with which legal and cultural blind spots baked in.

This matters because pretraining is not database lookup. A model does not store a neat card catalog of facts. It compresses statistical regularities from its corpus into billions of parameters. In effect, the training set becomes the model’s sensory world. If the corpus overrepresents Reddit arguments, SEO sludge, boilerplate legal templates, Python code, or fan fiction, the model internalizes that ecology. Its “common sense” is really a weighted average of what its dataset looked like.

That is why frontier labs guard data pipelines so fiercely. Architecture papers get published. Dataset recipes usually do not. The industry has learned a painful lesson: once you have a competent transformer, the biggest gains often come not from radically new math, but from better data mixtures, better deduplication, better filtering, better curricula.

The counterintuitive fact is this: **more data is often worse data**. If you pour trillions of low-quality tokens into a model, you are not just adding noise. You are spending scarce compute teaching the model the wrong statistical habits.

## Common Crawl: The Ocean Everything Starts From

Most open web-scale text corpora begin with **Common Crawl**, a nonprofit that has been crawling the public web since 2008. Every month it captures billions of pages. A single recent crawl, from April 2024, contained roughly **2.7 billion web pages** and about **386 TiB of uncompressed HTML**. That is not a dataset in the sense researchers want; it is raw ore.

Raw Common Crawl is a mess. HTML boilerplate overwhelms actual prose. Navigation menus repeat on every page. There is spam, scams, machine-translated junk, AI-generated sludge, and endless duplicates. Many pages are half code, half CSS, half broken Unicode. Some are empty shells with one paragraph and forty tracking scripts. If you trained directly on it, your model would become weird in exactly the way you would expect from learning language from pop-ups and cookie banners.

So the modern data pipeline begins with extraction. Strip HTML. Identify the main text. Detect language. Remove boilerplate. Throw away pages with too little alphabetic content, too much repetition, too many suspicious tokens, or too many stop-word anomalies. Then deduplicate.

Deduplication is one of the least glamorous and most consequential steps in the entire field. Exact dedup removes byte-identical copies. Near-dedup, often with **MinHash** or locality-sensitive hashing, removes pages that are not identical but are effectively the same article mirrored across a thousand sites. Why does this matter? Because duplicates act like the model’s equivalent of hearing the same rumor 500 times. They distort the estimated distribution, encourage memorization, and contaminate evaluations when benchmark questions appear verbatim in training.

The data problem, in other words, is not finding text. It is finding text worth compressing.

## C4, WebText, and the First Generation of “Cleaned Web” Corpora

Two influential early recipes show how the field learned to turn web junk into model food.

OpenAI’s **WebText**, used for GPT-2 in 2019, was built from roughly **45 million outbound links from Reddit posts with at least 3 karma**. That sounds almost laughably ad hoc, and in a sense it was. But it captured an important intuition: use human attention as a quality filter. If lots of Reddit users thought a page was interesting enough to upvote, it might be better than a random web page. WebText was never fully released, but its design shaped many later datasets.

Google’s **C4** — the Colossal Clean Crawled Corpus — was the dataset behind T5. It was derived from a single Common Crawl snapshot and ended up around **156 billion to 172 billion GPT-2 tokens**, depending on counting scheme. C4’s cleaning rules became famous: remove non-English pages, strip boilerplate, filter “bad words,” discard documents with weird punctuation ratios, and so on.

And here the field hit one of its first big sociotechnical potholes. In 2021, researchers at the Allen Institute, the University of Washington, and the Distributed AI Research Institute audited C4 in *Documenting Large Webtext Corpora*. They showed that blocklists meant to filter toxic content also disproportionately removed text about marginalized groups and text written in minority dialects. A cleaning rule that sounds sensible at 2 a.m. in a Jupyter notebook — “drop pages containing slurs” — can silently erase reclaimed language, queer discourse, and discussions of racism. A supposedly neutral filter becomes a cultural editor.

That was a warning shot for the entire field. Every dataset is also a theory of what counts as “good language.”

## The Pile: Curated Diversity as an Engineering Strategy

If Common Crawl is raw ocean water, **The Pile** was an attempt to bottle a mineral-balanced blend. Released by EleutherAI in 2020, The Pile combined **22 components** into an **825 GiB** English-language corpus. Its ingredients included PubMed papers, arXiv, GitHub, Stack Exchange, Project Gutenberg, OpenSubtitles, patents, Wikipedia, and a large controversial component called **Books3**.

The important idea behind The Pile was not just size. It was **mixture design**. Web text gives breadth, but curated domains give depth. Scientific papers teach technical syntax and citation style. Code teaches formal structure. Books teach long-range narrative. Q&A sites teach instructional explanation. Patents teach procedural language and obscure terminology. Mixing domains helps models generalize because language is not one thing; it is many overlapping registers.

This turns out to matter enormously. A model trained only on clean encyclopedic prose becomes stiff and brittle. A model trained only on raw web sludge becomes fluent but unreliable. The art is in the blend.

The Pile also helped open science by giving researchers something rare: a public large-scale corpus they could actually train on and inspect. That mattered because for years, top labs were publishing model breakthroughs built on private datasets that nobody else could reproduce. The Pile did not close that gap, but it narrowed it.

It also exposed the next big problem.

## The Dirty Secret: Some of the Best Data Is Legally and Ethically Radioactive

One reason frontier model training data is so secretive is that some of the highest-value text on Earth sits in legal gray zones.

Take **Books3**, a roughly **37 GB** corpus of pirated books folded into The Pile. Books are incredibly valuable training material. They contain coherent long-form structure, polished editing, rare vocabulary, and sustained argument across hundreds of pages — exactly the kind of distribution that makes models better at long-range coherence. But many of those books were copyrighted. That fact has now rippled outward into lawsuits against Meta, OpenAI, Anthropic, and others.

The code world hit a parallel controversy. **The Stack**, assembled by Hugging Face and the BigCode collaboration, contained **more than 6 TB of permissively licensed source code** across **358 programming languages**. BigCode built opt-out mechanisms and license tracking precisely because the legal status of code training data was impossible to ignore after the Copilot lawsuits.

This is the real dirty secret of training data: the web contains immense amounts of useful text, but usefulness and legitimacy are not the same thing. The highest-signal corpora are often the ones with the most complicated copyright, consent, or provenance story.

The public picture is therefore oddly inverted. Labs say “trained on publicly available data,” which sounds transparent but often isn’t. “Publicly available” does not mean public domain. It may simply mean reachable by a crawler.

## RefinedWeb, FineWeb, and the Rise of Data-Centric LLM Science

Around 2023, researchers started proving something surprisingly radical: with good enough filtering, **web data alone** could beat hand-curated corpora.

The strongest early statement came from the **RefinedWeb** work behind Falcon, led by researchers at the Technology Innovation Institute in Abu Dhabi. Their paper argued that after aggressive filtering and deduplication, Common Crawl still yielded about **5 trillion tokens** of high-quality text. They publicly released a **500–600 billion token** subset and showed that small models trained on it could outperform peers trained on mixtures including books and Wikipedia.

That result cut against years of intuition. Many people assumed curated sources were inherently superior. RefinedWeb suggested that the web was not too small or too dirty; we just had not learned how to refine it well enough.

Then came **FineWeb** from Hugging Face in 2024, using **96 Common Crawl snapshots** and constructing an openly available corpus at roughly **15 trillion tokens** scale. FineWeb-Edu went a step further by training classifiers to identify educationally dense text — an attempt to predict not just whether a page is clean, but whether it teaches something.

At the same time, **Dolma** from Ai2 released **3 trillion tokens** spanning web text, academic papers, code, books, and encyclopedic sources as the corpus behind OLMo. And **DataComp-LM**, a benchmark effort involving researchers from MIT, Stanford, MosaicML, and others, published a standardized candidate pool of roughly **240 trillion tokens** extracted from Common Crawl so researchers could systematically compare filtering recipes. One striking DCLM result: a **7B model trained on 280B carefully selected tokens** could beat **Llama 2 7B** on MMLU while using about **7× less compute**.

That is a profound shift. For years the field was architecture-centric. DCLM and related work made it clear that data curation can buy you what looks like algorithmic progress.

In other words: if compute is money, data quality is exchange rate.

## Why Dedup, Filtering, and Mixture Design Change Model Behavior

Think of training as sculpting a probability distribution. Every token nudges the shape a little. If you repeat boilerplate millions of times, you flatten the sculpture in one direction. If you mix in books, code, and science papers, you carve out other dimensions.

Three levers matter most.

### 1. Deduplication

Without dedup, the web lies about consensus. Syndicated AP stories, mirrored blog posts, scraped copies, GitHub forks, and templated SEO pages appear far more often than their informational value warrants. Near-deduplication reduces memorization and improves benchmark hygiene. It also changes style: models become less obsessed with cliché phrasings because they are not hammered by the same sentence thousands of times.

### 2. Quality Filtering

Heuristics such as punctuation ratios, perplexity scoring, language ID, line repetition, and classifier-based scoring try to separate “human-useful” text from garbage. Increasingly, labs use **small quality models** to score documents before a bigger model ever sees them. One elegant irony of modern LLM training is that we now use language models to decide which text future language models deserve to read.

### 3. Mixture Weighting

A corpus is not just a pile; it is a recipe. Meta said **Llama 3** was trained on roughly **15 trillion tokens**, with **over 5% non-English data** across about **30 languages** and **4× more code than Llama 2**. Those mixture choices are not cosmetic. More code improves reasoning over formal syntax and tool use. More multilingual data broadens coverage but competes with English capacity. Higher-quality domains late in training can produce a kind of curriculum effect, where the model first absorbs broad patterns and then sharpens on denser text.

This is why data scientists at frontier labs are not just janitors. They are de facto cognitive dieticians.

## Contamination, Synthetic Sludge, and the Coming Data Wall

Training data has another problem: we are running out of uncontaminated internet.

Benchmarks leak into training sets. Model-generated text is now flooding the web. SEO farms use AI to create pages whose purpose is not to inform humans but to attract search traffic. That means future models risk learning from the low-grade outputs of previous models — like an ecosystem where every predator starts eating processed versions of its own waste.

Researchers sometimes call this **model collapse**, though the catastrophic versions are probably overstated for real-world mixtures. Still, the danger is real enough that labs aggressively filter suspected synthetic text and maintain high-trust sources. Human-written books, vetted code repositories, academic corpora, and licensed media become more valuable precisely because the open web is becoming less reliable.

This is the deeper reason proprietary data deals matter. Reddit sold API access. News publishers signed licensing agreements. Stack Overflow cut arrangements. Shutterstock, Axel Springer, the Financial Times, Vox Media — these deals are not just about legal safety. They are about securing clean, fresh, high-signal text in a web increasingly polluted by AI exhaust.

The data wall may be the next scaling wall.

## Why the Best Labs Became Obsessed With Provenance

A frontier training corpus today is closer to a supply chain than a dataset. Labs track provenance, licensing, deduplication lineage, opt-out lists, benchmark overlap, domain weights, and post-hoc audits. They do this partly for ethics, partly for lawsuits, partly for public relations — but also because provenance is technically useful.

If a model starts regurgitating a copyrighted paragraph, you want to know which source likely taught it that paragraph. If safety evals show odd behavior in one language or domain, you want to trace its diet. If performance on biomedical QA jumps after changing your PubMed weight, that is not magic; it is mixture science.

The modern LLM stack therefore has an unglamorous core truth: the future of AI may hinge less on discovering a new transformer block than on building better data refineries.

---

The first generation of LLM discourse treated data as fuel. The emerging view is that data is more like upbringing. Two models with similar parameter counts and compute budgets can become noticeably different “minds” if one is raised on deduplicated educational text and the other on a swamp of scraped repetition.

That is why the biggest labs spend millions not merely collecting text, but arguing over it. Which sources are worth licensing? How hard should you filter? How do you preserve minority voices without amplifying abuse? When does code help language? When does multilingual coverage dilute depth? These are not side questions. They are central design decisions about what kind of intelligence you are manufacturing.

And once you have that giant pretrained model — fed, filtered, deduplicated, and statistically shaped — the next question becomes obvious: how do you adapt it to a specific task without paying frontier-training costs all over again?

*Tomorrow we move from pretraining corpora to the next great trick of the modern LLM era: **fine-tuning and transfer learning** — how a general-purpose foundation model becomes a coder, a chat assistant, a legal summarizer, or a medical helper with surprisingly little additional data.*

---

<div style="margin-top: 2em; padding: 1.5em; background: #1a1a2e; border-radius: 8px; border: 1px solid #16213e;">

## 📝 Quiz — Day 9

Test your understanding of today's lesson.

<a href="quizzes/day-09.toml" class="quiz-embed" style="display: inline-block; margin-top: 1em; padding: 0.75em 1.5em; background: #e94560; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Take the Day 9 Quiz →</a>

</div>
