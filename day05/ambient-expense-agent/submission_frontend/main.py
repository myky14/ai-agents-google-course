import os
from typing import Literal
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

# Ensure env vars are loaded before service import
from dotenv import load_dotenv
load_dotenv()

from submission_frontend.services.session_service import DashboardSessionService

app = FastAPI(title="Manager Expense Approval Dashboard")

# Mount static files and templates
frontend_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(frontend_dir, "static")
templates_path = os.path.join(frontend_dir, "templates")

# Initialize directories if they don't exist
os.makedirs(static_path, exist_ok=True)
os.makedirs(templates_path, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=templates_path)

# Initialize Session Service layer
project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
agent_runtime_id = os.environ.get("AGENT_RUNTIME_ID")

if not project_id or not agent_runtime_id:
    raise RuntimeError("Missing required environment variables: GOOGLE_CLOUD_PROJECT, AGENT_RUNTIME_ID")

# Strip environment key for API safety if Vertex AI is forced
os.environ.pop("GOOGLE_API_KEY", None)

session_service = DashboardSessionService(
    project_id=project_id,
    location="us-east1",
    agent_engine_id=agent_runtime_id.split("/")[-1] # Extract ID if full URN path is passed
)


class DecisionRequest(BaseModel):
    action: Literal["approve", "reject"] = Field(..., description="The decision to submit.")


@app.get("/", response_class=HTMLResponse)
async def read_dashboard(request: Request):
    """Serve the single-page dashboard UI."""
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )


@app.get("/api/pending")
async def get_pending_approvals():
    """Discover sessions with active human_decision RequestInputs."""
    try:
        pending = await session_service.get_pending_approvals()
        return {"pending": pending}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pending sessions: {str(e)}")


@app.get("/api/session/{session_id}")
async def get_session_details(session_id: str):
    """Fetch complete details and historical events of a session."""
    try:
        details = await session_service.get_session_details(session_id)
        if not details:
            raise HTTPException(status_code=404, detail="Session not found")
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch session details: {str(e)}")


@app.post("/api/action/{session_id}")
async def submit_approval_decision(session_id: str, payload: DecisionRequest):
    """Resume workflow by submitting approval/rejection decision."""
    try:
        result = await session_service.resume_session(
            session_id=session_id,
            action=payload.action
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit decision: {str(e)}")
