# Day 23: Agents & Tool Use — From Chatbot to Autonomous Worker

*The moment language models stopped just talking about the world and started acting in it.*

---

## The Chatbot Ceiling

By mid-2023, large language models had become stunningly good at conversation. They could explain quantum mechanics to a five-year-old, write poetry in the style of Neruda, draft legal contracts, and debug Python code. But they shared a crippling limitation: they could only *talk*. Ask GPT-4 to check the current weather, and it would confidently hallucinate a forecast. Ask it to book a restaurant, and it would write you a lovely script for a phone call you'd still have to make yourself. Ask it to research a topic in real-time, and it would fabricate plausible-sounding citations from papers that didn't exist.

The gap between what these models *knew how to describe* and what they could actually *do* was enormous. Closing that gap — giving models hands, eyes, and the ability to interact with the digital world — has become arguably the most consequential frontier in AI. It's the difference between a brilliant advisor locked in a room and a brilliant advisor who can walk out the door and get things done.

This is the story of how language models became *agents*.

## What Makes an Agent an Agent?

The word "agent" gets thrown around loosely in AI circles, so let's be precise. An LLM agent is a system where a language model doesn't just generate text in response to a prompt — it *plans*, *acts*, *observes* the results of its actions, and *iterates*. It operates in a loop rather than a single pass.

The canonical agent loop looks like this:

1. **Perceive** — receive an observation (user request, tool output, environment state)
2. **Think** — reason about what to do next
3. **Act** — choose and execute an action (call a tool, write code, click a button)
4. **Observe** — process the result
5. **Repeat** until the task is complete or the agent decides to stop

This loop is conceptually simple, but it represents a profound shift. A chatbot is stateless: you ask, it answers. An agent maintains a trajectory — an evolving history of thoughts, actions, and observations — and makes sequential decisions under uncertainty. It's the difference between answering a trivia question and playing chess.

## The Research Lineage: From ReAct to Toolformer

### ReAct: Thinking Out Loud While Doing Things

The foundational paper for modern LLM agents is **ReAct** (Reason + Act), published by Shunyu Yao and colleagues at Princeton and Google Brain in October 2022. The insight was elegantly simple: let the model interleave *reasoning traces* with *actions* in a single generation.

Before ReAct, researchers had explored reasoning and acting as separate capabilities. Chain-of-thought prompting (Wei et al., 2022) showed that models reason better when they "think step by step." Tool-use research showed models could call APIs. ReAct fused them. A ReAct agent processing the question "What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?" would generate something like:

> **Thought:** I need to find the eastern sector of the Colorado orogeny, then find the elevation range of that area.
> **Action:** Search["Colorado orogeny eastern sector"]
> **Observation:** The eastern sector extends into the High Plains.
> **Thought:** I need to find the elevation range of the High Plains.
> **Action:** Search["High Plains elevation range"]
> **Observation:** The High Plains rise from around 1,800 ft to 7,000 ft.
> **Answer:** Approximately 1,800 to 7,000 feet.

On the HotpotQA benchmark, ReAct with a PaLM-540B backbone achieved 35.1% exact match, outperforming chain-of-thought alone (29.4%) and action-only approaches (25.7%). More importantly, the interleaved traces made the agent's reasoning *inspectable* — you could see exactly why it made each decision, which is critical for debugging and trust.

### Toolformer: Teaching Models to Use Tools on Their Own

While ReAct relied on prompting to elicit tool use, Meta's **Toolformer** (Schick et al., February 2023) took a more radical approach: *fine-tune* the model to spontaneously insert API calls into its own generations.

The method was clever. The researchers started with a GPT-J 6.7B model and a set of tool APIs (calculator, search engine, calendar, translator, Q&A system). They prompted the model to annotate a large text corpus with API calls at positions where a tool would be helpful, then filtered the annotations by whether the tool's output actually *reduced the loss* on the subsequent text. The surviving annotations became training data. After fine-tuning, Toolformer would naturally generate text like:

> "The population of Toronto is [QA("What is the population of Toronto?") → 2,794,356] 2,794,356."

The key insight: the model learned *when* to use tools, not just *how*. On math problems, Toolformer's 6.7B model with a calculator outperformed the much larger OPT 66B model without one. A small model with the right tools beat a large model relying on memorization alone.

### MRKL, Gorilla, and the API Explosion

Other milestone works expanded the tool-use landscape. **MRKL** (Modular Reasoning, Knowledge, and Language; Karpas et al., May 2022) proposed routing between expert modules. **Gorilla** (Patil et al., May 2023) fine-tuned LLaMA-7B on 1,645 API documentation pages from TorchHub, TensorHub, and HuggingFace, achieving 20% better API call accuracy than GPT-4 and hallucinating APIs far less often. The insight: models trained explicitly on API documentation become dramatically better at calling those APIs correctly.

## The Agent Zoo: Architectures That Emerged

### AutoGPT and the Autonomy Hype Cycle

In March 2023, developer Toran Bruce Richards released **AutoGPT**, an open-source project that wrapped GPT-4 in a persistent loop with internet access, file management, and long-term memory. Within weeks it became the fastest-growing GitHub repository in history, accumulating over 100,000 stars. AutoGPT captured the public imagination: an AI that could set its own goals, break them into subtasks, execute them, and learn from failures.

The reality was sobering. AutoGPT was breathtakingly unreliable. It would spin in circles, repeat failed actions, lose track of its goals, and burn through API credits at alarming rates. A task a human could complete in 10 minutes might cost $5-15 in API calls and still fail. But AutoGPT's cultural impact was enormous — it demonstrated the *concept* of autonomous agents and catalyzed a wave of more sophisticated successors.

### Function Calling: The Infrastructure Play

Rather than relying on fragile text-parsing to extract tool calls from model outputs, OpenAI introduced **function calling** in June 2023 as a first-class API feature. Developers could define tool schemas in JSON, and the model would return structured function calls rather than free-text descriptions of what it wanted to do. This was more than a convenience — it was a reliability revolution. Structured outputs eliminated an entire class of parsing failures and made tool use production-ready.

Anthropic followed with tool use support for Claude in April 2024, and Google integrated function calling into Gemini. By early 2025, every major model provider supported structured tool calling, and it became the standard interface between models and external systems.

### The Planning Problem

The hardest challenge for agents isn't using tools — it's knowing *which* tools to use, in *what order*, for *how long*. This is the planning problem, and it remains largely unsolved for complex tasks.

Consider a seemingly simple request: "Find the cheapest flight from Istanbul to Tokyo next month and book it." A human breaks this into obvious steps: search flights, compare prices, select the best option, enter payment details. But an LLM agent must handle branching decisions (direct vs. connecting flights?), recover from failures (site timeout?), manage state across many steps (remember the best price found so far), and know when to stop (is this price good enough, or should I check another site?).

Research from Princeton's SWE-bench team showed that success rates on multi-step tasks drop roughly exponentially with the number of steps. If each step succeeds 90% of the time, a 10-step task succeeds only 35% of the time. A 20-step task? 12%. This "compound error" problem is why current agents handle 3-5 step tasks well but struggle with genuinely complex workflows.

## Computer Use: Models That See and Click

The most dramatic expansion of agent capabilities came with **computer use** — models that can see a screen and control a mouse and keyboard, interacting with software the same way humans do.

Anthropic launched computer use as a beta feature with Claude 3.5 Sonnet in October 2024. The model receives screenshots, reasons about what's on screen, and outputs mouse coordinates and keyboard actions. On the OSWorld benchmark — a suite of real computer tasks across Ubuntu, Windows, and macOS — Claude 3.5 Sonnet scored 14.9% in a screenshot-only setting, which sounds low until you consider that the previous best AI score was 12.24% and many tasks involve complex multi-application workflows that challenge even humans unfamiliar with the software.

By late 2025, computer use had matured rapidly. Anthropic's Claude Opus 4.5 was marketed as "the best model in the world for coding, agents, and computer use." Google's Project Mariner let Gemini navigate web browsers autonomously. OpenAI's Operator product offered agent-driven web interactions. The scores on benchmarks like WebArena and OSWorld climbed steadily, but a significant gap remained between benchmark performance and real-world reliability.

Here's the counterintuitive part: **computer use is often the wrong approach**, even when it works. Interacting with a GUI by taking screenshots, reasoning about pixel coordinates, and simulating clicks is extraordinarily expensive — each step might cost 5-10x more tokens than an equivalent API call. It's like having a brilliant employee who insists on using every piece of software through a remote desktop connection rather than logging in directly. Computer use matters most as a *universal fallback* — a way to interact with systems that don't have APIs — not as the primary tool-use mechanism.

## The Agentic Coding Revolution

Nowhere has the agent paradigm proven more powerful than in software engineering. Coding is the *perfect* agent domain: the environment is digital, the feedback loop is fast (run the code, see if it works), and the output is verifiable.

**SWE-bench**, introduced by Carlos Jimenez and colleagues at Princeton in October 2023, became the standard benchmark. It presents real GitHub issues from popular Python repositories and asks models to generate patches that pass the repository's test suite. The original dataset contained 2,294 tasks; a curated subset of 500, called SWE-bench Verified, was human-validated for solvability.

The progress has been staggering. In early 2024, the best models solved around 10-15% of SWE-bench Verified. By mid-2025, Claude Sonnet 4 with an agentic harness hit 72.7%. By late 2025, scores exceeded 80%. These agents don't just write code — they read codebases, trace through function calls, write tests, debug failures, and iterate until the fix works.

Products built on this capability proliferated. GitHub Copilot evolved from autocomplete to a full agent that could implement features from issue descriptions. Anthropic released Claude Code, a CLI tool that could navigate repositories, understand codebases, and implement multi-file changes. OpenAI's Codex agent could handle complete development tasks autonomously. Cursor, Windsurf, and other AI-native IDEs turned coding into a conversational process where the programmer describes intent and the agent writes and debugs the implementation.

## Multi-Agent Systems: Swarms and Hierarchies

A natural question: if one agent is good, are many agents better? Multi-agent architectures explore exactly this.

**Generative Agents** (Park et al., Stanford, April 2023) placed 25 LLM-powered characters in a simulated town called Smallville. Each agent had a memory, daily schedule, and the ability to interact with others. They spontaneously organized a Valentine's Day party, formed social groups, and spread information through gossip networks — all without explicit programming of these behaviors.

In practical systems, multi-agent architectures typically use a **hierarchical** structure: an orchestrator agent that breaks tasks into subtasks and delegates them to specialist agents. Microsoft's AutoGen framework, Anthropic's multi-agent patterns, and LangChain's agent executor all implement variations of this pattern. A research agent might have a planner, a searcher, a writer, and a fact-checker, each specialized for their role.

The results are mixed. Multi-agent systems can handle more complex tasks and provide natural modularity, but they also multiply the compound error problem and introduce coordination overhead. A 2024 study from Tsinghua University found that multi-agent debate (having agents argue about answers) improved accuracy on reasoning tasks by 5-10%, but added 3-5x latency and cost.

## The Trust Problem

The biggest obstacle to agent adoption isn't capability — it's trust. When a chatbot hallucinates, the human reads the output and catches the error. When an agent hallucinates, it might *act* on the hallucination — sending an email, executing a trade, deleting a file — before anyone notices.

This asymmetry has led to a spectrum of autonomy models:

- **Human-in-the-loop**: The agent proposes actions, the human approves them. Safe but slow.
- **Human-on-the-loop**: The agent acts autonomously but the human can intervene. The "self-driving car with a steering wheel" model.
- **Full autonomy**: The agent operates independently with defined guardrails. Only viable for low-stakes, well-bounded tasks.

Most production agent systems today operate in the first or second mode. Anthropic explicitly designs Claude's tool use with human approval steps. OpenAI's Operator asks for confirmation before taking irreversible actions. The industry consensus: we're not ready for full autonomy on high-stakes tasks, and the models themselves know this — they're explicitly trained to express uncertainty and ask for guidance when unsure.

## Where We Are Now

As of early 2026, the agent landscape looks roughly like this:

**What works well:** Single-domain tasks with clear success criteria — coding, data analysis, research with web search, structured workflows with well-defined APIs. Agentic coding tools are generating real productivity gains, with studies from Google, Microsoft, and others reporting 25-50% time savings on certain programming tasks.

**What works sometimes:** Cross-application workflows (the "book my travel" use case), complex research requiring synthesis of multiple sources, tasks requiring judgment calls about ambiguous situations.

**What still fails:** Long-horizon tasks requiring 20+ sequential decisions, tasks in adversarial environments (where websites or systems actively resist automation), anything requiring common-sense physical reasoning, and tasks where the cost of failure is high and reversibility is low.

The surprising truth about agents is that the *model* is increasingly not the bottleneck. The hard problems are infrastructure (reliable tool APIs, authentication, error handling), UX (how do you supervise an agent without losing the speed benefit?), and trust (how do you verify an agent's work without redoing it?). The LLM in the middle is just the brain — and the brain was always the easy part compared to the body.

---

*Tomorrow, we'll explore one of the most successful agent applications of all: **code generation**. From Copilot's autocomplete origins to autonomous software engineering agents that solve real GitHub issues, we'll trace how code became the killer app for LLMs — and why writing code might be fundamentally different from other tasks models attempt.*

---

<div style="margin-top: 2rem; padding: 1.5rem; background: #1a1a2e; border-radius: 8px; border: 1px solid #16213e;">

### 📝 Quiz Time!

Test your understanding of today's lesson:

<a href="quizzes/day-23.toml" style="display:inline-block;padding:0.75rem 1.5rem;background:#e94560;color:white;border-radius:4px;text-decoration:none;font-weight:bold;">Take the Day 23 Quiz →</a>

</div>
