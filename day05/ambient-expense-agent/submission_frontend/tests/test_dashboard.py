import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from submission_frontend.services.session_service import DashboardSessionService

# Standard Mock Objects
@pytest.fixture
def mock_vertexai():
    with patch("submission_frontend.services.session_service.vertexai") as mock_v:
        yield mock_v

@pytest.fixture
def mock_session_service():
    mock_svc = MagicMock()
    mock_svc.list_sessions = AsyncMock()
    mock_svc.get_session = AsyncMock()
    return mock_svc

@pytest.fixture
def dashboard_service(mock_vertexai, mock_session_service):
    with patch("submission_frontend.services.session_service.VertexAiSessionService", return_value=mock_session_service):
        svc = DashboardSessionService(
            project_id="test-project",
            location="us-east1",
            agent_engine_id="5300842314531340288"
        )
        yield svc

@pytest.mark.asyncio
async def test_get_pending_approvals_discovers_active_decision(dashboard_service, mock_session_service):
    """
    Test that session discovery identifies sessions currently suspended waiting for human_decision.
    """
    # 1. Mock list_sessions to return a list containing a session
    mock_session_summary = MagicMock()
    mock_session_summary.id = "sess-123"
    mock_session_summary.user_id = "user-123"

    mock_list_resp = MagicMock()
    mock_list_resp.sessions = [mock_session_summary]
    mock_session_service.list_sessions.return_value = mock_list_resp

    # 2. Mock get_session to return session with human_decision long_running_tool_id
    mock_event = MagicMock()
    mock_event.long_running_tool_ids = ["human_decision"]

    mock_session_detail = MagicMock()
    mock_session_detail.id = "sess-123"
    mock_session_detail.user_id = "user-123"
    mock_session_detail.last_update_time = 123456.78
    mock_session_detail.state = {
        "expense": {"amount": 150.0, "submitter": "Bob"},
        "risk_review": {"risk_score": 4},
        "formatted_expense": "Submitter: Bob, Amount: $150.00"
    }
    mock_session_detail.events = [mock_event]

    mock_session_service.get_session.return_value = mock_session_detail

    # Run discovery
    pending = await dashboard_service.get_pending_approvals()

    # Assert session was discovered
    assert len(pending) == 1
    assert pending[0]["session_id"] == "sess-123"
    assert pending[0]["expense"]["amount"] == 150.0
    assert pending[0]["risk_review"]["risk_score"] == 4
    mock_session_service.list_sessions.assert_called_once_with(app_name="expense_agent")
    mock_session_service.get_session.assert_called_once_with(
        app_name="expense_agent",
        session_id="sess-123",
        user_id="user-123"
    )

@pytest.mark.asyncio
async def test_get_pending_approvals_skips_completed_sessions(dashboard_service, mock_session_service):
    """
    Test that sessions that are completed or not waiting for human_decision are ignored.
    """
    mock_session_summary = MagicMock()
    mock_session_summary.id = "sess-456"
    mock_session_summary.user_id = "user-456"

    mock_list_resp = MagicMock()
    mock_list_resp.sessions = [mock_session_summary]
    mock_session_service.list_sessions.return_value = mock_list_resp

    # Mock completed session event (no long_running_tool_ids)
    mock_event = MagicMock()
    mock_event.long_running_tool_ids = None
    mock_event.output = {"status": "Approved"}

    mock_session_detail = MagicMock()
    mock_session_detail.id = "sess-456"
    mock_session_detail.user_id = "user-456"
    mock_session_detail.state = {}
    mock_session_detail.events = [mock_event]

    mock_session_service.get_session.return_value = mock_session_detail

    pending = await dashboard_service.get_pending_approvals()

    # Assert no pending sessions returned
    assert len(pending) == 0

@pytest.mark.asyncio
async def test_resume_session_approve_action(dashboard_service, mock_session_service):
    """
    Test that submitting an "approve" action correctly sends the query to the Vertex AI agent.
    """
    # Mock list_sessions to resolve the user_id for the session
    mock_session = MagicMock()
    mock_session.id = "sess-abc"
    mock_session.user_id = "user-abc"

    mock_list_resp = MagicMock()
    mock_list_resp.sessions = [mock_session]
    mock_session_service.list_sessions.return_value = mock_list_resp

    # Mock agent.async_stream_query as an async generator
    async def mock_async_generator(*args, **kwargs):
        # Yield single final event
        yield {"output": {"status": "Approved", "method": "Manual approval"}}

    dashboard_service.agent.async_stream_query = mock_async_generator

    # Run action
    result = await dashboard_service.resume_session("sess-abc", "approve")

    # Assert success and correct action passed
    assert result["status"] == "success"
    assert result["action_submitted"] == "approve"
    assert result["outcome"]["status"] == "Approved"

@pytest.mark.asyncio
async def test_resume_session_reject_action(dashboard_service, mock_session_service):
    """
    Test that submitting a "reject" action correctly sends the query to the Vertex AI agent.
    """
    # Mock list_sessions to resolve the user_id for the session
    mock_session = MagicMock()
    mock_session.id = "sess-xyz"
    mock_session.user_id = "user-xyz"

    mock_list_resp = MagicMock()
    mock_list_resp.sessions = [mock_session]
    mock_session_service.list_sessions.return_value = mock_list_resp

    # Mock agent.async_stream_query as an async generator
    async def mock_async_generator(*args, **kwargs):
        yield {"output": {"status": "Rejected", "method": "Manual rejection"}}

    dashboard_service.agent.async_stream_query = mock_async_generator

    # Run action
    result = await dashboard_service.resume_session("sess-xyz", "reject")

    # Assert success and correct action passed
    assert result["status"] == "success"
    assert result["action_submitted"] == "reject"
    assert result["outcome"]["status"] == "Rejected"
