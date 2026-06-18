# 🤖 Google 5-Day AI Agents Intensive Course Workspace

Welcome to your workspace for the **Google 5-Day AI Agents Intensive Course** (often referred to as the *Intensive Vibe Coding Course*). This repository is structured to organize your daily codelabs, concepts, personal notes, and capstone project as you learn to build, evaluate, and deploy production-ready agentic systems using Google Gemini.

---

## 🎯 Course Overview & Purpose

The goal of this course is to transition from basic prompt engineering and simple LLM API calls to building fully autonomous, reliable, and stateful AI agents. You will explore modern agentic patterns, tools discovery, session persistence, and production evaluation.

### 📅 Daily Curriculum Structure

*   **[day01](file:///F:/Studyspace/AI_Agents_5_Day_Google/day01/) - Introduction to Agents & Agentic Workflows**
    *   *Focus:* Foundational concepts, taxonomy of agent capabilities, and how agentic design differs from standard LLM applications. Understanding "Agent Ops" and security.
*   **[day02](file:///F:/Studyspace/AI_Agents_5_Day_Google/day02/) - Agent Tools & Interoperability (MCP)**
    *   *Focus:* Connecting agents to external tools, APIs, and databases. In-depth focus on the **Model Context Protocol (MCP)** for standardized tool discovery and execution.
*   **[day03](file:///F:/Studyspace/AI_Agents_5_Day_Google/day03/) - Context Engineering: Sessions & Memory**
    *   *Focus:* Managing short-term and long-term memory. Implementing session states and context retention over multi-turn interactions.
*   **[day04](file:///F:/Studyspace/AI_Agents_5_Day_Google/day04/) - Agent Quality & Evaluation**
    *   *Focus:* Measuring performance, reliability, and accuracy. Learn best practices for testing, debugging, and optimizing agent outputs under production-grade scenarios.
*   **[day05](file:///F:/Studyspace/AI_Agents_5_Day_Google/day05/) - Prototype to Production**
    *   *Focus:* Deploying, scaling, and observing agents in the real world. Moving agents from a local sandbox to live environments.
*   **[capstone](file:///F:/Studyspace/AI_Agents_5_Day_Google/capstone/) - Capstone Project**
    *   *Focus:* Applying all learnings from Days 1-5 to build and showcase a custom, real-world AI agent application.
*   **[notes](file:///F:/Studyspace/AI_Agents_5_Day_Google/notes/) - Personal Study Notes**
    *   *Focus:* Scratchpads, conceptual diagrams, summaries, and links to external resources (such as Kaggle Learn notebooks).

---

## 🛠️ Tech Stack

This project utilizes the following technologies:
*   **Language:** Python 3.10+
*   **SDK:** [Google GenAI SDK](https://github.com/googleapis/python-genai) (`google-genai`) for interacting with Gemini models
*   **UI Framework:** [Streamlit](https://streamlit.io/) for fast prototyping of agent interfaces
*   **Models:** `gemini-2.5-flash` (or newer models supported in the SDK)
*   **Environment management:** `dotenv` for securing credentials

---

## 🚀 Setup & Installation Instructions

Follow these steps to set up your local development environment:

### 1. Prerequisites
Ensure you have **Python 3.10** or higher installed. You can check your version by running:
```bash
python --version
```

### 2. Set Up Virtual Environment
Create and activate a Python virtual environment to keep dependencies isolated:

*   **Create environment:**
    ```bash
    python -m venv .venv
    ```

*   **Activate environment:**
    *   **Windows (PowerShell):**
        ```powershell
        .venv\Scripts\Activate.ps1
        ```
    *   **Windows (CMD):**
        ```cmd
        .venv\Scripts\activate.bat
        ```
    *   **macOS / Linux:**
        ```bash
        source .venv/bin/activate
        ```

### 3. Install Dependencies
Install all package requirements, including the Google GenAI SDK and Streamlit:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
You need a Google Gemini API Key. If you do not have one, generate it at [Google AI Studio](https://aistudio.google.com/).

1. Create a `.env` file in the root of the project:
   ```text
   GEMINI_API_KEY=your_actual_api_key_here
   ```
2. The code in this workspace automatically loads this variable or looks for it in your environment.

### 5. Verify Setup
Run the included test script to verify that your SDK installation can successfully call the Gemini API:
```bash
python test_gemini.py
```
This script queries the `gemini-2.5-flash` model and prints a response explaining AI agents.

---

## 📂 Project Repository Tree

```text
├── .venv/                  # Virtual environment folder (ignored by git)
├── capstone/               # Capstone project code and materials
├── day01/                  # Day 1: Introduction to Agents & Agentic Workflows
├── day02/                  # Day 2: Agent Tools & Interoperability (MCP)
├── day03/                  # Day 3: Context Engineering: Sessions & Memory
├── day04/                  # Day 4: Agent Quality & Evaluation
├── day05/                  # Day 5: Prototype to Production
├── notes/                  # Course notes, references, and scratchpads
├── .env                    # Environment variables (private, ignored by git)
├── .gitignore              # Files and folders ignored by git
├── README.md               # Project documentation (this file)
├── requirements.txt        # Python dependency requirements
└── test_gemini.py          # Quick setup verification script
```
