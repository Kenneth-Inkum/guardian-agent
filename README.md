# 🛡️ Guardian Agent: Self-Healing AI Triage

This is a lightweight AI microservice built to demonstrate **resilient, unattended LLM workflows**. 

In the real world, LLMs frequently hallucinate or fail to return strict JSON formats, which breaks downstream systems. This project solves that by implementing a **Self-Healing Try-Catch Loop**.

### 🚀 Key Features Demonstrated (Aligning with AI Web Developer Role)

* **Failure Recovery:** If the AI returns malformed JSON, the system intercepts the `SyntaxError`, dynamically rewrites the prompt to include the error log, and forces the model to auto-correct itself.
* **Unattended Automation:** Once deployed, it can process webhooks or user inputs infinitely without human intervention, logging its success/failure rates to a local SQLite database.
* **Full-Stack Integration:** Uses an Express.js server to bridge the gap between a simple front-end UI and complex back-end AI orchestration.

### 🛠️ The Tech Stack
* **Backend:** Node.js, Express
* **AI:** OpenAI API (`gpt-4o`)
* **Database:** SQLite3 (for auditing and state management)
* **Frontend:** Vanilla HTML/CSS/JS

### 💡 Why I Built This
While my core background is in traditional full-stack software engineering, I am actively diving deeper into AI integrations. 

When reviewing the requirements for the AI Web Developer role at Invenio Search Group, I noticed a strong emphasis on building "unattended automations that recover from failure." I decided to spend some time to actually build it.

I created this Guardian Agent to demonstrate how my foundational engineering skills (Node.js, Express, state management via SQLite) translate directly into building resilient, fault-tolerant AI systems. It proves I understand the difference between a brittle API call and a robust AI workflow.
---
*Note: The current prompt in `index.js` is intentionally sabotaged with a conversational prefix to force the AI to break the JSON parse on Attempt 1, explicitly demonstrating the self-healing recovery loop in the UI.*