# Manager Expense Approval Dashboard

A standalone single-page web dashboard for managers to review and resolve pending expense approval tasks from the Ambient Expense Agent.

---

## Features

- **Pending Approvals Feed**: Automatically scans active agent sessions in Vertex AI for pending `human_decision` wait states (Human-in-the-Loop interrupts).
- **AI Risk Insights**: Shows the LLM-generated risk score, risk factors, and textual explanation directly on the expense card.
- **Audit Trail Timeline**: Highlights the sequential path taken by the agent (from parsing through security checkpoints to human review) with a full JSON state inspector.
- **Interactive Action Control**: Allows managers to approve or reject the claims with one click, resuming the paused session on the Agent Runtime.
- **Premium Dark UI**: Built with a responsive glassmorphic design and CSS micro-animations.

---

## Setup & Running Locally

### 1. Configure Environment Variables
Copy the `.env.example` file and populate it with your GCP settings:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
GOOGLE_CLOUD_PROJECT=ai-agents-course-499804
GOOGLE_CLOUD_LOCATION=us-east1
AGENT_RUNTIME_ID=5300842314531340288
```

### 2. Authenticate with Google Cloud
Verify that Application Default Credentials (ADC) are configured for your local session:
```bash
gcloud auth application-default login
```

### 3. Install Dependencies
Sync dependencies in your current environment:
```bash
uv pip install -e .
```

### 4. Run the Dashboard
Start the local FastAPI development server:
```bash
uvicorn main:app --reload --port 8000
```

### 5. Access UI
Open your browser and navigate to:
[http://localhost:8000](http://localhost:8000)

---

## Testing

Verify code correctness by running the dashboard test suite:
```bash
uv run pytest tests
```
