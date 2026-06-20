# 🤖 Google 5-Day AI Agents Intensive Course Workspace

Welcome to my portfolio workspace for the **Google 5-Day AI Agents Intensive Course**. This repository documents the daily projects, architectural concepts, personal notes, and capstone work developed to master autonomous, reliable, and stateful AI agents using the Google Gemini ecosystem.

---

## 🎯 Course Roadmap & Progress

- **Day 1: Introduction to Agents & Vibe Coding** ✅
  * Foundational agent taxonomies, structured JSON outputs, and fast prototype-to-cloud deployments.
- **Day 2: Agent Tools & Interoperability (MCP)** ✅
  * Command-line interfaces, sandboxed systems, and Model Context Protocol (MCP) integrations.
- **Day 3: Context Engineering: Sessions & Memory** ⏳ *Pending*
- **Day 4: Agent Quality & Evaluation** ⏳ *Pending*
- **Day 5: Prototype to Production** ⏳ *Pending*
- **Capstone Project: Stateful Agent Application** ⏳ *Pending*

---

## 📊 Course Progress Summary

| Day | Project / Codelab | Key Achievements | Status | Documentation / Code |
| :--- | :--- | :--- | :---: | :---: |
| **Day 1** | **AI SQL Analyst Assistant** | Structured JSON outputs, dynamic schema parsing, and interactive SVG dashboard charts. | 🚀 Completed | [View Project](day01/ai-sql-analyst-assistant/) |
| **Day 2** | **CLI & MCP Tool Integration** | Antigravity CLI workspace trust, BigQuery release RSS parsing, and Google Developer Knowledge MCP. | 🚀 Completed | [View Project](day02/) |

---

## 🚀 Completed Projects

### 📱 Day 1: AI SQL Analyst Assistant
*   **Location:** [`day01/ai-sql-analyst-assistant`](day01/ai-sql-analyst-assistant/)
*   **Live Demo:** [https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app](https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app)
*   **Purpose:** Empower users to query relational databases in plain English. The agent converts business queries into optimized, dialect-specific SQL, breaks down query logic step-by-step, draft business insights, and renders dynamic preview dashboards (Bar, Line, Area, and Pie charts) using simulated datasets.
*   **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Express, and Google GenAI SDK (`@google/genai` with `gemini-3.5-flash`).

### 📊 Day 2: BigQuery Release Notes Tracker & MCP Setup
*   **Location:** [`day02/projects/bigquery-release-notes-tracker`](day02/projects/bigquery-release-notes-tracker/)
*   **Purpose:** Monitors Google Cloud's BigQuery system updates in real-time. It groups releases dynamically, offers social draft utilities with character tracking, and demonstrates tool interoperability.
*   **Model Context Protocol (MCP):** Configured the remote `google-developer-knowledge` MCP server to query up-to-date Google Cloud docs, generate automated drive upload scripts, and design an end-to-end Document AI billing pipeline.
*   **Tech Stack:** Python 3.10+, Flask, RSS/XML parsing, Google API client library, and Model Context Protocol (MCP).

---

## 💡 What I Learned So Far

*   **Day 1 (Agent Workflows):** Moving from basic prompt-response completions to structured, schema-enforced agent outputs. By designing rigorous JSON response schemas and system instructions, we can guarantee that an agent generates correct SQL dialects and maps outcomes to interactive charting interfaces reliably.
*   **Day 2 (Agent Interoperability):** Extending agent capabilities through execution sandboxes (Antigravity CLI) and standard APIs. Utilizing the Model Context Protocol (MCP) transforms agents from text-based summarizers into interactive systems that retrieve live, official technical documentation on-demand, write drive upload scripts, and design production pipelines with up-to-date SDK knowledge.

---

## 🛠️ Key Skills Practiced

*   **AI Agent Architectures:** Planning, verification, and human-in-the-loop validation workflows.
*   **Vibe Coding:** Accelerated dashboard prototyping using interactive AI tooling.
*   **Antigravity IDE & CLI:** Session authorization, sandbox testing, and TUI agent traces.
*   **Model Context Protocol (MCP):** Dynamic schema discovery, document indexing, and remote tool execution.
*   **Google AI Studio:** System instructions refinement, safety parameters config, and Structured JSON Schema definitions.
*   **Cloud Run Deployment:** Serverless container packaging and GCP deployment pipelines.
*   **Full Stack Prototyping:** Node.js, Express, React 19, Tailwind CSS v4, Python, and Flask development.

---

## 📂 Project Repository Tree

```text
├── .venv/                      # Python virtual environment (ignored)
├── capstone/                   # Capstone project workspace (upcoming)
├── day01/                      # Day 1: Introduction to Agents & Vibe Coding
│   └── ai-sql-analyst-assistant/
│       ├── images/             # Documentation screenshots
│       ├── src/                # React client source files
│       ├── package.json        # Node dependencies and build scripts
│       ├── server.ts           # Express server & Gemini API integration
│       └── .env.example        # Template for local environment setup
├── day02/                      # Day 2: Agent Tools & Interoperability (MCP)
│   ├── projects/
│   │   └── bigquery-release-notes-tracker/ # Flask release tracker app
│   ├── screenshots/            # Verification screenshots
│   ├── upload_to_drive.py      # Google Drive upload script generated via MCP
│   └── README.md               # Day 2 portfolio documentation
├── notes/                      # Course notes, references, and scratchpads
├── .gitignore                  # Configured Git ignore patterns
├── README.md                   # Workspace repository documentation (this file)
├── requirements.txt            # Python dependency requirements for workspace scripts
└── test_gemini.py              # Quick workspace API connectivity test script
```

---

## 🛠️ General Workspace Setup & Installation

### Prerequisites
*   **Python 3.10+** (for python scripts)
*   **Node.js 18+** (for frontend applications)

### 1. Workspace Virtual Environment (Python)
To configure python scripts and test environments in the workspace root:
```bash
python -m venv .venv
# Activate on Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Activate on macOS/Linux:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

### 2. Configure Environment Variables
You need a Google Gemini API Key. If you do not have one, generate it at [Google AI Studio](https://aistudio.google.com/).

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Verify Local API Connectivity
```bash
python test_gemini.py
```

---

> [!IMPORTANT]
> **Security Note:** Never commit your actual `.env` file or expose your API keys in any public workspace. Both the root and sub-project `.gitignore` profiles are strictly configured to prevent sensitive files from being pushed to Git.
