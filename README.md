# 🤖 Google 5-Day AI Agents Intensive Course Workspace

Welcome to my portfolio workspace for the **Google 5-Day AI Agents Intensive Course**. This repository contains hands-on projects, study notes, and the capstone project developed to master autonomous, reliable, and stateful AI agents using the Google Gemini ecosystem.

---

## 📊 Course Progress & Daily Projects

| Day | Project Name | Description | Status | Demo Link |
| :--- | :--- | :--- | :---: | :---: |
| **Day 1** | **AI SQL Analyst Assistant** | Natural Language to SQL converter with automated insights & charts. | 🚀 Completed | [Live Demo](https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app) |
| **Day 2** | *Agent Tools & MCP* | Connecting agents to external resources and APIs via Model Context Protocol. | ⏳ Upcoming | - |
| **Day 3** | *Sessions & Memory* | Short/long-term persistence & context management in multi-turn interactions. | ⏳ Upcoming | - |
| **Day 4** | *Quality & Evaluation* | Evaluation frameworks, performance testing, and agent alignment. | ⏳ Upcoming | - |
| **Day 5** | *Prototype to Production* | Deploying, monitoring, and scaling agents in production environments. | ⏳ Upcoming | - |
| **Capstone**| *Stateful Agent Application*| Comprehensive real-world production-grade agent implementation. | ⏳ Upcoming | - |

---

## 🚀 Day 1 Project: AI SQL Analyst Assistant

The **AI SQL Analyst Assistant** is an intelligent assistant designed to streamline database analytics. It enables users—ranging from non-technical business leaders to busy data engineers—to query databases using plain language. 

*   **Live Demo:** [https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app](https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app)
*   **Location:** [`day01/ai-sql-analyst-assistant`](file:///F:/Studyspace/AI_Agents_5_Day_Google/day01/ai-sql-analyst-assistant/)

### 🎯 Purpose
Connecting databases to business intelligence workflows can be a bottleneck. This project uses Gemini's advanced semantic understanding to instantly translate questions to clean, optimized, dialect-specific SQL, explain the generated queries step-by-step, draft business insights, highlight structural assumptions, and dynamically render interactive preview dashboards.

### ✨ Key Features
*   **Multi-Dialect Support:** Tailor SQL output for PostgreSQL, MySQL, BigQuery, Snowflake, SQLite, Spark SQL, and SQL Server.
*   **Interactive Dashboard Preview:** Automatically maps output metrics to the best visualization type (Bar, Line, Area, or Pie chart) with realistic mock dataset generation.
*   **Detailed Explanations:** Breaks down the generated SQL syntax step-by-step for educational review and debugging.
*   **Strategic Business Insights:** Interprets data outputs to provide actionable business implications and KPI advice.
*   **Limitation & Assumption Tracking:** Outlines schema assumptions, missing parameters, and structural index advice transparently.

### 🛠️ Tech Stack
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React (Icons), Motion (Animations)
*   **Backend:** Node.js, Express, `dotenv`
*   **AI Engine:** Google GenAI SDK (`@google/genai`) powered by the **`gemini-3.5-flash`** model (leveraging Structured JSON Outputs)

---

## 📂 Project Repository Tree

```text
├── .venv/                  # Python virtual environment folder (ignored)
├── capstone/               # Capstone project workspace (upcoming)
├── day01/                  # Day 1: Introduction to Agents & Agentic Workflows
│   └── ai-sql-analyst-assistant/
│       ├── src/            # React client source files (App.tsx, components)
│       ├── index.html      # HTML entrypoint
│       ├── package.json    # Node dependencies and build scripts
│       ├── server.ts       # Express server & Gemini API integration
│       ├── tsconfig.json   # TypeScript configuration
│       ├── vite.config.ts  # Vite build configurations
│       └── .env.example    # Template for local environment setup
├── day02/                  # Day 2: Agent Tools & Interoperability (MCP)
├── day03/                  # Day 3: Context Engineering: Sessions & Memory
├── day04/                  # Day 4: Agent Quality & Evaluation
├── day05/                  # Day 5: Prototype to Production
├── notes/                  # Course notes, references, and scratchpads
├── .gitignore              # Configured Git ignore patterns
├── README.md               # Main repository documentation (this file)
├── requirements.txt        # Python dependency requirements for general workspace scripts
└── test_gemini.py          # Quick workspace SDK connectivity test script
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

## 🖥️ Running Day 1 Project Locally

Navigate to the project folder and start the dev server:

```bash
cd day01/ai-sql-analyst-assistant
npm install
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY
npm run dev
```
Open your browser to `http://localhost:3000` to interact with the assistant.

---

> [!IMPORTANT]
> **Security Note:** Never commit your actual `.env` file or expose your API keys in any public workspace. Both the root and sub-project `.gitignore` profiles are strictly configured to prevent sensitive files from being pushed to Git.
