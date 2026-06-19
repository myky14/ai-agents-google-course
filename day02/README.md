# Google Antigravity AI Agents: CLI & Web Dashboard Integration

This repository showcases interactive projects and foundational architectural concepts explored during Day 2 of the Google AI Agents program. The exercises demonstrate how autonomous developer agents integrate with command-line interfaces, manage external data streams, and build responsive web tools.

---

## 💡 What I Learned

* **Orchestrating Parallel Agent Services**: Designed and hosted concurrent local web servers (Flask) to validate agent communication channels and port mappings.
* **Streamlining Real-time XML Ingestion**: Integrated automated data collection pipelines that fetch, filter, and cache RSS feed data using rate-limiting mitigation rules.
* **Applying Agent UI Integrations**: Designed client-side social draft builders that validate text lengths dynamically to enhance user-facing workflows.
* **Understanding Agent Protocol Architectures**: Learned the standard protocol framework (MCP, A2A, A2UI, AP2, and UCP) that will shape machine-to-machine transactions and data queries in next-generation AI platforms.

---

## 📂 Repository Folder Structure

```text
day02/
├── agy-cli-projects/
│   ├── bq-releases-notes/
│   │   ├── app.py                # BigQuery Release Dashboard and RSS parser
│   │   ├── hello_app.py          # Verification web portal (Port 5001)
│   │   ├── static/
│   │   │   ├── css/styles.css    # Custom dark-mode glassmorphic styling
│   │   │   └── js/app.js         # Interactive search, filters, & Twitter intent composer
│   │   └── templates/
│   │       ├── about.html        # Information page portal
│   │       └── index.html        # Main dashboard home template
│   ├── news.txt                  # Raw news text file used in CLI tasks
│   └── summary.txt               # AI-summarized output of news text
└── screenshots/
    ├── hello-flask-app.png       # Hello Flask UI verification output
    ├── bigquery-release-tracker.png # BigQuery Release Dashboard interface
    └── artifact-review.png       # TUI/IDE Artifact review checkpoint UI
```

---

## 🛠️ Antigravity CLI (`agy`) Setup

The **Antigravity CLI (`agy`)** acts as the agentic control terminal for the workspace. 

* **Getting Started**: Initializing `agy` kicks off an OAuth flow to authenticate directly with a Google account, establishing a secure workspace session.
* **TUI Execution**: The CLI enables direct command execution, planning visualization, and context tracing inside a secure sandbox environment.

---

## 🚀 Exercise 1: Hello from Antigravity CLI

The first exercise serves as a verification portal to validate that the local development server connects correctly with the agent environment on an isolated port (`5001`).

* **Outcome**: A minimalist, high-speed Python Flask application that receives requests and returns confirmation data, proving the agent's ability to provision and boot running web services locally.

### Verification Screenshot

![Hello Flask App Verification](screenshots/hello-flask-app.png)

---

## 📊 Exercise 2: BigQuery Release Notes Tracker

This project is a feature-rich analytics dashboard that acts as a real-time monitor for Google Cloud's BigQuery system updates.

* **Outcome**: An interactive, dark-mode dashboard configured to run on port `5000`. It consolidates official Google Cloud release streams, groups them dynamically, and provides social draft utilities.
* **Key Features**:
  * **Categorized Updates**: Parses release descriptions and groups them into clean status categories (Features, Announcements, Deprecations, and Issues) for quick scanning.
  * **Real-time Live Sync**: Features a cache-busting sync mechanism to pull down-to-the-minute release feed items.
  * **Interactive Tweet Composer**: A dedicated tool allowing developers to select release notes via checkboxes, auto-compile a social media post, track character limit constraints, and launch an X/Twitter web intent instantly.

### Dashboard Interface Screenshot

![BigQuery Release Tracker Dashboard](screenshots/bigquery-release-tracker.png)

---

## 🧬 Google Antigravity Agent Protocol Stack

Antigravity operates on five core open protocols designed to move AI agents beyond basic chat tools and into autonomous, action-oriented systems:

### System Interaction Flow
1. **User** interacts with the **Agent-to-User Interface (A2UI)** dashboard.
2. The UI communicates with the **Antigravity Agent**.
3. The Agent queries **Model Context Protocol (MCP)** tools and databases.
4. The Agent collaborates with external merchant agents via **Agent-to-Agent (A2A)** protocols.
5. Secure transactions are completed using **Agent Payments (AP2)** and the **Universal Commerce Protocol (UCP)**.

---

### 1. MCP (Model Context Protocol)
* **What it is**: A standard connection protocol for data sources and developer tools.
* **Significance**: MCP acts as a universal adapter (the "USB-C port" of AI context). It allows the agent to securely query local databases, read code repositories, and invoke terminals without requiring custom, brittle API integrations.

### 2. A2A (Agent-to-Agent Protocol)
* **What it is**: An interoperability standard for cross-agent communication.
* **Significance**: Standardizes how different AI agents discover one another, negotiate tasks, and pass structured instructions. This allows a generalist developer agent to delegate specialized sub-tasks to other helper agents.

### 3. A2UI (Agent-to-User Interface Protocol)
* **What it is**: A system for agents to render native, interactive UI components directly to the user.
* **Significance**: Enables the agent to deliver dynamic screens, visual progress meters, and dashboard widgets instead of static text blocks, resulting in an interactive developer experience.

### 4. AP2 (Agent Payments Protocol)
* **What it is**: A secure transaction and authorization layer for AI.
* **Significance**: Establishes spending rules, authorization request pathways, and cryptographically signed audit logs. This allows agents to pay for cloud resources or purchase dependencies under strict, user-defined budgets.

### 5. UCP (Universal Commerce Protocol)
* **What it is**: A commerce framework for machine-to-machine checkout processes.
* **Significance**: Standardizes cart configuration, checkout stages, and inventory verification. It allows agents to purchase software licenses or developer assets directly from multiple online catalogs.

---
*Developed under the Google DeepMind Advanced Agentic Coding course.*
