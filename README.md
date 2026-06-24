# 🤖 Google / Kaggle 5-Day Gen AI Intensive Course 2026

> **Student:** Nguyễn Du Mỹ Kỳ — Business Information Systems (BIS)
> **Program:** Google / Kaggle 5-Day Gen AI Intensive Course 2026
> **Focus:** AI Agent Engineering · Security · Human-in-the-Loop · Evaluation

[![Days Completed](https://img.shields.io/badge/Days%20Completed-5%20of%205-blue)](#learning-journey)
[![Status](https://img.shields.io/badge/Status-5%20of%205%20Days%20Completed-brightgreen)](#learning-journey)
[![Platform](https://img.shields.io/badge/Platform-Google%20ADK%202.0-orange)](#key-skills-practiced)

---

## 👤 About Me

| | |
| :--- | :--- |
| **Name** | Nguyễn Du Mỹ Kỳ *(Nguyen Du My Ky)* |
| **Role** | Business Information Systems Student · University of Economics Ho Chi Minh City (UEH) |
| **Interests** | AI Agents · Business Analysis · Data Analytics · ERP Systems · Workflow Automation |
| **GitHub** | [@myky14](https://github.com/myky14) |
| **LinkedIn** | [linkedin.com/in/myky14](https://www.linkedin.com/in/myky14/) |

---

## 📋 Overview

This repository documents my hands-on work throughout the **Google / Kaggle 5-Day Gen AI Intensive Course 2026** — a structured engineering program focused on building production-grade AI agents using Google's Agent Development Kit (ADK 2.0), Gemini models, and the Antigravity IDE.

Over five days, the course progresses from foundational LLM integration through full agent orchestration, security hardening, evaluation methodology, and ambient event-driven deployment. Rather than surface-level prompt experimentation, this course treats AI agents as **software engineering artifacts** requiring the same rigor as any other production system: modular architecture, test coverage, security review, and iterative evaluation.

**My learning goals:**
- Understand how ADK 2.0 structures agent graphs, tools, and workflows.
- Design production-ready agents with trust boundaries, HITL gates, and security checkpoints.
- Apply static analysis, threat modeling, and TDD to secure agent development.
- Build the foundation needed for AI-augmented Business Analysis, ERP automation, and multi-agent orchestration.

---

## 🗓️ Learning Journey

| Day | Topic | Key Project | Status |
| :---: | :--- | :--- | :---: |
| **01** | Foundations — LLM Integration & Vibe Coding | AI SQL Analyst Assistant | ✅ Completed |
| **02** | Agent Tools & Interoperability (MCP) | BigQuery Release Notes Tracker | ✅ Completed |
| **03** | ADK Agent Workflows & Human-in-the-Loop | Customer Support Agent (Graph) | ✅ Completed |
| **04** | Agent Security, Evaluation & Secure Coding Gates | Ambient Expense Agent + Secure Shopping Assistant | ✅ Completed |
| **05** | Multi-Agent Systems & Deployment | Ambient Expense Agent (Production) | ✅ Completed |

---

## 🏗️ Repository Structure

```
AI_Agents_5_Day_Google/
├── README.md                        # This portfolio landing page
├── day01/                           # Day 01: AI SQL Analyst Assistant
│   └── ai-sql-analyst-assistant/    # React + Express + Gemini API web app
├── day02/                           # Day 02: Agent Tools & MCP Integration
│   ├── projects/
│   │   └── bigquery-release-notes-tracker/
│   └── README.md
├── day03/                           # Day 03: ADK Graph Workflows & HITL
│   ├── .agents/skills/              # Installed agent skills (Levels 1–4)
│   ├── customer-support-agent/      # ADK 2.0 graph workflow agent
│   └── README.md
├── day04/                           # Day 04: Security, Evaluation & Secure Gates
│   ├── ambient-expense-agent/       # ADK 2.0 ambient Pub/Sub expense processor
│   ├── shopping-assistant/          # Secure shopping assistant with TDD & Semgrep
│   ├── threat_model.md              # STRIDE security assessment
│   ├── screenshots/                 # Visual walkthroughs (17 screenshots)
│   └── README.md
├── day05/                           # Day 05: Multi-Agent Systems & Deployment
│   ├── ambient-expense-agent/       # Production-ready agent with fastapi/agent_runtime
│   ├── screenshots/                 # Playground and dashboard execution screenshots
│   └── README.md                    # Capstone project report
├── capstone/                        # Capstone project workspace
└── notes/                           # Course notes and scratchpads
```

---

## 🛠️ Key Skills Practiced

| Domain | Skills |
| :--- | :--- |
| **Agent Frameworks** | ADK 2.0, Agents CLI, Google Gemini Models |
| **IDE & Tooling** | Antigravity IDE, Antigravity Hooks, MCP Protocol |
| **Agent Design Patterns** | Human-in-the-Loop (HITL), Ambient Agents, Graph Workflows |
| **Security Engineering** | STRIDE Threat Modeling, Semgrep Static Analysis, Pre-Commit Security Gates |
| **Security Patterns** | Prompt Injection Defense, PII Redaction, Security Checkpoints, Agent PreToolUse Hooks |
| **Testing & Evaluation** | LLM-as-a-Judge Evaluation, Outcome-Based Security Tests, Test-Driven Development (TDD) |
| **Backend Infrastructure** | FastAPI, Cloud Run Readiness, Event-Driven Architectures |
| **Web Development** | React 19, TypeScript, Tailwind CSS v4, Express |

---

## 🌟 Project Highlights

### Day 01 — AI SQL Analyst Assistant
**Project:** [`day01/ai-sql-analyst-assistant`](day01/ai-sql-analyst-assistant/) | **[Live Demo →](https://ai-sql-analyst-assistant-567449380471.asia-southeast1.run.app)**

A full-stack web application that allows business users to query relational databases in plain English. The agent converts natural language into optimized, dialect-specific SQL and renders results as interactive charts.

- **Key Achievement**: Designed rigorous JSON response schemas and system instructions to guarantee structured SQL output across multiple dialects.
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, Express, Gemini API (`gemini-3.5-flash`).
- **Takeaway**: Moving from basic prompt-response completions to schema-enforced structured agent outputs dramatically improves reliability.

---

### Day 02 — Agent Tool Integration & Model Context Protocol (MCP)
**Project:** [`day02/`](day02/)

Built a BigQuery release notes tracker that surfaces Google Cloud system updates in real-time, and connected agents to live external knowledge via the Model Context Protocol (MCP). By querying the official Google Developer Knowledge MCP server, the agent retrieved up-to-date SDK documentation — knowledge that falls outside its training window — and used it to autonomously generate a functional Google Drive upload script.

- **Key Achievement**: Agent autonomously produced a working Drive upload script and designed a Document AI billing pipeline by querying live, authoritative documentation through MCP — without any hardcoded API references.
- **Takeaway**: Connecting agents to live data sources through standard protocols (MCP) transforms them from static text generators into systems that can act on current, real-world knowledge.

---

### Day 03 — ADK Agent Workflows & HITL
**Project:** [`day03/`](day03/)

Progressed through four levels of Agent Skills (from simple instruction-following to multi-step orchestration), and built a Customer Support Agent using ADK 2.0's directed graph workflow. Explored conditional routing, reusable capabilities, and context engineering.

- **Key Achievement**: Scaffolded a graph-based customer support agent with conditional routing — a shipping FAQ path vs. a graceful decline node — verified in the local ADK Playground.
- **Takeaway**: Modular skills design prevents context rot and makes agent behavior verifiable by separating concerns into distinct, testable components.

---

### Day 04 — Agent Security, Evaluation & Secure Coding Gates
**Project:** [`day04/`](day04/) | **[Detailed README →](day04/README.md)**

The most security-intensive day of the course. Built two production-relevant projects:

**Codelab 1 — Ambient Expense Agent** (`day04/ambient-expense-agent/`):
An event-driven corporate expense processing agent. It is triggered by Pub/Sub events via a FastAPI endpoint, applies PII redaction, runs a multi-layer security checkpoint (with prompt injection detection), and routes requests through either auto-approval (<$100) or a Human-in-the-Loop gate.

> ⚠️ **Critical Finding**: Evaluation discovered that low-value prompt injection attempts (under the $100 auto-approval threshold) could bypass the security checkpoint, since routing happened *before* security scanning. This is a real class of logic-ordering vulnerability in production agent pipelines.

**Codelab 2 — Secure Shopping Assistant** (`day04/shopping-assistant/`):
A retail assistant with a full secure development pipeline:
- **Semgrep Pre-Commit Gate**: A hardcoded mock API key (`api_key="AIzaSyD-mock-key-value-12345"`) was intentionally introduced to trigger and demonstrate the security gate. Semgrep blocked the commit, and the credential was refactored to load from environment variables.
- **Antigravity PreToolUse Hook**: Intercepts all `run_command` calls and validates them against a security script before execution, blocking destructive commands.
- **STRIDE Threat Model**: A local `threat_model.md` was generated covering all six STRIDE pillars.
- **TDD Security Test Suite**: Outcome-based pytest tests verified all security boundaries for the discount redemption tool.

- **Takeaway**: Local commit hooks and agent hooks are a good first line of defense, but not sufficient on their own — identical gates must be enforced in CI/CD pipelines, since local hooks can be bypassed with `--no-verify`.

---

### Day 05 — Ambient Expense Agent (Multi-Agent Systems & Deployment)
**Project Workspace:** [`day05/ambient-expense-agent`](day05/ambient-expense-agent/) | **[Detailed Project Report →](day05/README.md)** | **[Sub-project README →](day05/ambient-expense-agent/README.md)**

Implemented a production-ready, security-first **Ambient Expense Agent** and deployed it to the managed **Google Vertex AI Agent Runtime** (Reasoning Engines). The system integrates an event-driven ingestion pipeline via Pub/Sub, automated risk scoring, and a web-based dashboard on Cloud Run.

**Summary:**
* Built and deployed an Ambient Expense Agent using Google ADK.
* Implemented security review and HITL approval workflow.
* Deployed Manager Dashboard on Cloud Run.
* Integrated Pub/Sub event-driven architecture.
* Connected Agent Runtime, Session Service, and Dashboard.
* Completed end-to-end approval and rejection testing.

---

## 📸 Screenshots & Documentation

Visual walkthroughs and detailed notes are available in each day's dedicated README:

| Day | Visual Documentation |
| :---: | :--- |
| Day 01 | [`day01/ai-sql-analyst-assistant/`](day01/ai-sql-analyst-assistant/) |
| Day 02 | [`day02/README.md`](day02/README.md) |
| Day 03 | [`day03/README.md`](day03/README.md) |
| Day 04 | [`day04/README.md`](day04/README.md) — 17 screenshots covering setup through secure commit |
| Day 05 | [`day05/README.md`](day05/README.md) — 6 screenshots covering playground to production dashboard |

---

## 💡 What I Learned

**1. Building agents is more than prompting.**
Agent reliability requires designing explicit schemas, validation layers, and behavioral constraints. A well-prompted agent still needs structured output, error handling, and testable tool interfaces.

**2. Security boundaries must be designed before deployment.**
Retrofitting security into a working agent is significantly harder than designing trust boundaries from the start. Threat modeling (STRIDE), pre-commit hooks, and input validation schemas all need to be foundational decisions — not afterthoughts.

**3. Deterministic business rules should remain outside the LLM.**
Routing decisions, approval thresholds, and access control checks should be expressed as explicit graph nodes and code — not left to the model's judgment. The Day 04 security gap (low-value injection bypass) was caused by conflating routing logic with security logic.

**4. Evaluation is a first-class engineering activity.**
Agent evaluation should include adversarial test cases specifically designed to probe security boundaries, not just accuracy metrics. The automated scorecard that revealed the prompt injection bypass was built with these adversarial scenarios in mind.

**5. AI agents require software engineering discipline.**
Version control, code linting, static analysis, test coverage, and structured logging are just as essential for agent systems as for any other production software.

---

## 🚀 Future Work

- [x] **Complete Day 05** — Multi-Agent Systems & Deployment
- [ ] **CI/CD Security Pipeline** — Add GitHub Actions with Semgrep to enforce the same gates that currently run only as local pre-commit hooks
- [ ] **Cloud Run Deployment** — Deploy production-ready agents with proper IAM roles and Secret Manager for credential handling
- [ ] **Adversarial Evaluation Suite** — Extend security test coverage to 50+ adversarial scenarios, covering the logic-ordering vulnerability identified in Day 04

---

## 🪞 Personal Reflection

As a Business Information Systems (BIS) student, I came into this course with a background in analytical frameworks, ERP systems, and process design — not deep software engineering. What surprised me most is how directly applicable enterprise thinking is to AI agent architecture.

The patterns I worked with this week — trust boundaries, escalation workflows, audit trails, and deterministic routing — are the same principles that underpin well-designed ERP approval chains and BI reporting pipelines. The difference is that AI agents can now execute these workflows in natural language, respond to unstructured events, and adapt to novel inputs that traditional rule-based systems cannot handle.

What I am building toward is the intersection of these domains: AI agents that can augment Business Analysis work (requirement extraction, process documentation), automate ERP data flows (expense validation, vendor reconciliation), and bring measurable accountability through structured evaluation and auditability. Day 04's security focus was a reminder that getting there requires the same rigor we expect from any production system — and that security, like testing, cannot be treated as optional.

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ (for Day 01 frontend)
- `uv` package manager (for Day 03/04 ADK projects)

### Quick Start (Root Workspace)
```bash
# Clone the repository
git clone https://github.com/myky14/AI_Agents_5_Day_Google.git
cd AI_Agents_5_Day_Google

# Set up Python environment
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Configure API key (obtain yours at https://aistudio.google.com/)
# Create a .env file and add your key:
echo 'GEMINI_API_KEY=your_key_here' > .env

# Verify connectivity
python test_gemini.py
```

> [!IMPORTANT]
> **Security Note:** Never commit your actual `.env` file or expose API keys. Both the root and all sub-project `.gitignore` files are configured to exclude sensitive credential files from version control.

---

<div align="center">

**Nguyễn Du Mỹ Kỳ · 2026**
*Google / Kaggle 5-Day Gen AI Intensive Course — Portfolio Repository*

</div>
