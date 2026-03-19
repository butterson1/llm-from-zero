# Day 21: Multimodal Models — Vision, Audio, and the Road to Unified Intelligence

*Why teaching a language model to see was shockingly easy — and why teaching it to truly understand what it sees is shockingly hard.*

---

## The Unification Thesis

For most of deep learning's history, vision and language lived in separate universes. Computer vision researchers trained convolutional neural networks on ImageNet. NLP researchers trained transformers on text corpora. The two communities attended different conferences, published in different journals, and largely ignored each other's work. A model that could describe a photo and also write an essay felt like science fiction — the neural equivalent of a bilingual brain that spoke two entirely unrelated languages.

Then, in January 2021, OpenAI released two papers on the same day that shattered this divide. CLIP (Contrastive Language-Image Pre-training) and DALL·E showed that you could bridge vision and language with a single training objective. CLIP learned to match images with text descriptions by training on 400 million image-text pairs scraped from the internet — no ImageNet labels required. DALL·E went the other direction, generating images from text prompts using a 12-billion parameter transformer that treated image patches as tokens, exactly the same way GPT-2 treated words.

The core insight was almost embarrassingly simple: if you can turn anything into tokens, you can model anything with a transformer. Images? Chop them into 16×16 patches and project each patch into an embedding vector. Audio? Convert the waveform into a spectrogram and tokenize that. Video? It's just a sequence of image frames. The transformer doesn't care what the tokens *represent*. It only cares about the statistical relationships between them.

This is the unification thesis, and it has dominated AI research since 2021: **one architecture, one training paradigm, many modalities.** The results have been spectacular — and the remaining gaps reveal just how far we still have to go.

---

## How Vision Enters a Language Model

There are fundamentally three strategies for making a language model "see," and understanding their differences is crucial for grasping where the field stands today.

### Strategy 1: The Vision Encoder Bridge

The most popular approach — used by GPT-4V, Claude 3, and LLaVA — is to keep a separate vision encoder and connect it to the language model through a learned projection layer. Here's the recipe:

1. **Start with a pre-trained vision encoder.** Typically this is a Vision Transformer (ViT) pre-trained with CLIP or SigLIP. Google's SigLIP-SO400M, trained on 400 million image-text pairs with a sigmoid loss instead of CLIP's contrastive softmax, has become a popular choice. The encoder takes a 384×384 image, divides it into 729 patches of 14×14 pixels each, and produces a 729-length sequence of 1,152-dimensional embedding vectors.

2. **Project vision tokens into the language model's embedding space.** A small MLP (typically two linear layers with a GELU activation) maps each 1,152-dimensional vision token to the language model's hidden dimension — say 4,096 for a 7B model. This projection layer has only a few million parameters. LLaVA-1.5, which proved this recipe could be stupidly simple and still work brilliantly, used a two-layer MLP with just 20 million parameters to bridge a SigLIP encoder and Vicuna-13B.

3. **Concatenate and attend.** The projected vision tokens are prepended to the text token sequence, and the language model processes them as if they were just more tokens. The transformer's self-attention handles the cross-modal reasoning — "what does patch 347 have to do with the word 'red'?" — automatically.

This approach is elegant because it leverages pre-trained components. You don't need to train a vision system from scratch (billions of dollars of CLIP-style pre-training is already done). You don't need to train a language model from scratch (Llama/Mistral/etc. already exist). You just train the bridge — a few million parameters — plus optionally fine-tune the whole system end-to-end.

LLaVA (Large Language and Vision Assistant), published by Haotian Liu at the University of Wisconsin-Madison in April 2023, proved this recipe could be shockingly effective. LLaVA-1.5-13B matched or beat commercial multimodal systems on 11 out of 12 benchmarks while costing roughly $200 in compute to train the projection layer. Two hundred dollars. That's less than a nice dinner in Manhattan.

### Strategy 2: Native Multimodal Pre-training

Google's Gemini family represents the opposite philosophy: train the model on all modalities from scratch, simultaneously, from the very first gradient update. Gemini 1.5 Pro was trained on text, images, video, and audio interleaved together, using a unified tokenizer that handles all modalities natively. The model doesn't have a bolted-on vision encoder — visual understanding is woven into its weights from the ground up.

The advantage is deeper cross-modal understanding. Because Gemini saw images and text together during pre-training — not just during fine-tuning — its visual reasoning can draw on the full depth of its representations. Google's Gemini 1.5 Pro can process up to 1 million tokens of multimodal input, and the team famously demonstrated it understanding a 45-minute silent film ("Sherlock Jr." by Buster Keaton) by ingesting the entire movie as a sequence of frames.

The disadvantage is cost. You can't cheaply swap in a better language model or a better vision encoder. You have to retrain the whole thing. Google can afford this because they're Google. Most labs cannot.

### Strategy 3: Tokenize Everything

A more radical approach converts all modalities into discrete tokens using learned tokenizers, then trains a single autoregressive transformer over the combined vocabulary. Meta's Chameleon (2024) took this approach: it used a VQ-VAE (Vector Quantized Variational Autoencoder) to convert 512×512 images into sequences of 1,024 discrete tokens from a codebook of 8,192 visual "words." These visual tokens were mixed into the same vocabulary as the 65,536 text tokens, creating a unified vocabulary of ~73,000 tokens. The 34-billion parameter Chameleon model was then trained autoregressively on interleaved image-text sequences — literally predicting the next token whether that token represents a word or a patch of pixels.

This is the purest expression of the unification thesis: there is no architectural distinction between modalities. An image is just a sentence in a visual language. The model can generate images, generate text, or generate both interleaved, all with the same next-token prediction objective.

---

## The Audio Revolution

While vision got the headlines, the quiet revolution in audio understanding may ultimately matter more. Consider the trajectory:

**Whisper (September 2022):** OpenAI trained an encoder-decoder transformer on 680,000 hours of multilingual audio-text pairs scraped from the internet. Whisper-large-v3, with 1.55 billion parameters, achieved human-level speech recognition across 99 languages. The training data was weakly supervised — auto-generated captions from YouTube, podcast transcripts, etc. — yet the model's robustness crushed commercially fine-tuned systems. Whisper made a profound point: if you have enough data, you don't need clean labels.

**AudioPalm (2023):** Google combined PaLM-2 with an audio encoder to create a model that could do speech-to-speech translation, hearing French and speaking English, while preserving the speaker's voice. This wasn't pipeline STT→translate→TTS. It was direct speech-to-speech, because the model understood both modalities at a representational level.

**GPT-4o (May 2024):** OpenAI's "omni" model processed audio natively — not by transcribing to text first. This meant it could hear tone of voice, detect sarcasm, respond with emotion, and handle overlapping speech and background noise. The response latency dropped to 232 milliseconds on average, approaching the 200ms of human conversational reaction time. For the first time, talking to an AI felt like talking *to* someone.

**Gemini 2.0 Flash (2025):** Google's model pushed native audio even further, supporting real-time conversational AI with tool use, where the model could hear a question, reason about it, call an API, and speak the answer — all in a single forward pass through a unified architecture.

The common thread: audio is being absorbed into the same multimodal framework as vision. Spectrograms are images. Waveforms are sequences. Everything is tokens.

---

## The Counterintuitive Truth About Visual Understanding

Here's the surprising part: despite stunning benchmark results, current multimodal models have embarrassingly brittle visual understanding. And the failures are revealing.

A 2024 study from Tong et al. ("Eyes Wide Shut? Exploring the Visual Shortcomings of Multimodal LLMs") found that models like GPT-4V and LLaVA consistently failed at basic visual tasks that any four-year-old could handle. Ask GPT-4V to count the number of circles in an image containing six circles, and it might say eight. Show it two nearly identical images and ask what changed, and it confabulates differences that don't exist. Present overlapping geometric shapes and ask which is in front, and it guesses randomly.

The reason connects back to how these models process images. When a ViT encoder chops an image into 14×14 patches, each patch is processed relatively independently before attention connects them. Fine spatial relationships — "this line connects to that corner" — get lost in the patchification. The model has never learned to *trace* a line the way a human eye does. It has learned to associate visual patterns with text descriptions, which is a fundamentally different kind of understanding.

This is why multimodal models excel at scene description ("a dog playing in a park"), visual question answering ("what color is the car?"), and OCR-like tasks (reading text in images), but struggle with spatial reasoning, counting, and geometric understanding. They're pattern matchers that have memorized an enormous number of image-text correlations, not visual reasoners that build 3D mental models of scenes.

The gap is closing. Google's Gemini 1.5 Pro and Anthropic's Claude 3.5 Sonnet showed significant improvements on spatial reasoning benchmarks in 2024-2025, likely because native multimodal training and higher-resolution processing help. But the fundamental tension remains: **matching visual patches to text is not the same as understanding visual structure.**

---

## Video: The Final Frontier (For Now)

If images are hard, video is a nightmare. A single 1080p frame, tokenized at 14×14 patches, produces roughly 6,000 tokens. A 30-second clip at 1 fps is 180,000 tokens. At the original 30 fps, it's 5.4 million tokens. Even with aggressive frame sampling and token compression, video understanding pushes against every scaling limit simultaneously: context length, memory, compute, and training data.

The current approaches are pragmatic compromises:

- **Sparse frame sampling:** GPT-4V and Claude process video by extracting a handful of frames (typically 4-32) and treating the task as multi-image understanding. This works surprisingly well for answering questions about a video's content but completely fails at understanding motion, temporal ordering, and cause-and-effect.

- **Dense token compression:** Gemini 1.5 Pro processes video as a dense sequence of frames but uses aggressive compression — each frame is reduced to fewer tokens via pooling or strided attention. This preserves temporal information but at the cost of spatial resolution.

- **Video-native architectures:** Models like VideoLLaMA and Video-ChatGPT add temporal position encodings and video-specific adapters to bridge video features into language models. These can reason about motion and temporal dynamics but are limited by the video encoder's representation quality.

The fundamental problem is data. There are roughly 1 trillion words of high-quality text on the internet. There are perhaps 10 billion image-text pairs. But high-quality video with dense, accurate narration? That barely exists at scale. YouTube has billions of videos, but their auto-generated captions are noisy, time-misaligned, and describe speech content rather than visual content. The video-text paired data problem is the single biggest bottleneck in multimodal AI.

---

## The Architecture of Modern Multimodal Models

Let's get concrete about what a state-of-the-art multimodal model looks like in 2025-2026. Take the Qwen2.5-VL family from Alibaba as a representative example:

- **Vision encoder:** ViT with 675 million parameters, processing images at dynamic resolution (from 224×224 up to 4,096×4,096 by dividing into tiles). Each tile produces 256 vision tokens after a 2D pooling layer.
- **Language model:** Qwen2.5-72B, a 72-billion parameter dense transformer with 80 layers, 64 attention heads, and GQA with 8 KV heads.
- **Projection:** A two-layer MLP mapping vision tokens (1,536-dim) to the LLM's hidden dimension (8,192-dim).
- **Video support:** Temporal position encodings allow frame-by-frame processing with timestamps.
- **Total parameters:** ~73 billion, of which vision components are less than 1%.

The asymmetry is striking. The vision encoder is less than 1% of the model's total parameters. The "multimodal" part of a multimodal model is, in parameter terms, a rounding error. Almost all the intelligence lives in the language model. This reflects a deep truth about current multimodal AI: **language is the backbone, and perception is a peripheral.** The model doesn't really "see" — it translates visual features into a format that its linguistic brain can reason about.

Compare this to the human brain, where roughly 30% of the cortex is dedicated to visual processing. Biological intelligence gives vision a massive computational budget. Current AI architectures are profoundly language-centric by comparison.

---

## Where Multimodality Is Going

Several research directions are converging to push beyond today's limitations:

**Unified generation models.** Janus-Pro from DeepSeek (2025) and similar models can both understand and generate images within the same architecture. Unlike DALL·E (which is generation-only) or LLaVA (which is understanding-only), these models can look at an image, reason about it in language, and then generate a new image based on that reasoning — all in a single forward pass. This is a step toward genuine visual imagination.

**Any-to-any models.** Meta's ImageBind (2023) demonstrated that you could create a shared embedding space across six modalities — images, text, audio, depth, thermal, and IMU (motion sensor) data — by training pairwise with images as the anchor. An embedding space that connects everything means you could theoretically query any modality with any other: hum a tune and find matching images, or feel a texture and retrieve the corresponding sound.

**World models.** The most ambitious vision for multimodal AI isn't understanding or generation — it's simulation. Yann LeCun has argued that truly intelligent systems need a "world model" that can predict how the physical world evolves over time. Google DeepMind's Genie 2 (2024) generates playable 3D environments from a single image, simulating physics, lighting, and object interactions. These aren't language models with vision bolted on; they're models that understand the visual world deeply enough to simulate it.

**Embodiment.** Figure's humanoid robots, powered by GPT-4V's multimodal understanding, can see objects on a table, hear a human request ("can you give me something to eat?"), reason about which objects are food, and execute the grasping motion — all through the multimodal model's cross-modal reasoning. When multimodal models get bodies, the applications multiply exponentially.

---

## The Surprising Lesson

Perhaps the most counterintuitive finding in multimodal AI research is this: **adding vision to a language model often improves the model's performance on pure language tasks.** Google reported that Gemini models trained on multimodal data scored higher on text-only benchmarks than equivalent models trained on text alone. The intuition is that visual data provides a grounding signal — a connection to the physical world — that helps the model build better internal representations of concepts like "above," "heavy," "red," or "broken."

This suggests that language-only models are actually handicapped. Humans don't learn language in a vacuum; we learn it while seeing, touching, hearing, and moving through a physical world. Every noun we know is connected to a visual prototype. Every verb is connected to a motor experience. Models trained only on text are learning language from a secondhand account of reality. Multimodal training gives them something closer to firsthand experience.

If this is right, then multimodal training isn't a feature bolted onto language models — it's a correction for a fundamental limitation of text-only training. The road to unified intelligence may not be about adding modalities to language. It may be about recognizing that language was never enough.

---

*Tomorrow, we leave the model itself and ask a practical question: what happens when your model doesn't know the answer? Day 22 explores Retrieval-Augmented Generation (RAG) — the technique that gives language models access to external memory, turning a frozen knowledge cutoff into a living, updatable knowledge base. If multimodal models learn to perceive the world, RAG teaches them to remember it.*

---

<div style="text-align: center; margin-top: 2em;">
<a href="https://llm.bayram.cloud/quizzes/day-21/" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">📝 Take the Day 21 Quiz</a>
</div>
