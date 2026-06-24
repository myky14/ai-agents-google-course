import os
import asyncio
from typing import List, Dict, Any, Optional
import vertexai
from google.adk.sessions import VertexAiSessionService

class DashboardSessionService:
    def __init__(self, project_id: str, location: str, agent_engine_id: str):
        self.project_id = project_id
        self.location = location
        self.agent_engine_id = agent_engine_id

        # Initialize Vertex AI
        vertexai.init(project=project_id, location=location)

        # Instantiate Session Service
        self.session_service = VertexAiSessionService(
            project=project_id,
            location=location,
            agent_engine_id=agent_engine_id
        )

        # Instantiate SDK Client for remote invocations (popping GOOGLE_API_KEY to ensure ADC usage)
        os.environ.pop("GOOGLE_API_KEY", None)
        self.client = vertexai.Client(project=project_id, location=location)
        self.agent = self.client.agent_engines.get(
            name=f"projects/{project_id}/locations/{location}/reasoningEngines/{agent_engine_id}"
        )

    async def get_pending_approvals(self) -> List[Dict[str, Any]]:
        """
        Retrieves all sessions from Vertex AI Session Service and filters for
        those that are currently waiting for human decision (HITL interrupt).
        """
        # List all sessions under the app "expense_agent"
        list_response = await self.session_service.list_sessions(app_name="expense_agent")

        pending_sessions = []
        for session in list_response.sessions:
            try:
                # Fetch full session details including events (required to check for RequestInput)
                sess = await self.session_service.get_session(
                    app_name="expense_agent",
                    session_id=session.id,
                    user_id=session.user_id
                )

                # Check if the session is currently waiting for human input
                if sess.events:
                    last_event = sess.events[-1]
                    # We check if long_running_tool_ids contains 'human_decision'
                    # which indicates the human approval gate has been hit and is active.
                    tool_ids = getattr(last_event, "long_running_tool_ids", None)
                    if tool_ids and "human_decision" in tool_ids:
                        pending_sessions.append({
                            "session_id": sess.id,
                            "user_id": sess.user_id,
                            "last_update_time": sess.last_update_time,
                            "expense": sess.state.get("expense", {}),
                            "risk_review": sess.state.get("risk_review", {}),
                            "formatted_expense": sess.state.get("formatted_expense", "")
                        })
            except Exception as e:
                # Skip individual session errors to prevent breaking the list view
                print(f"Error fetching session {session.id}: {e}")
                continue

        # Sort pending approvals: newest first
        pending_sessions.sort(key=lambda s: s.get("last_update_time", 0), reverse=True)
        return pending_sessions

    async def get_session_details(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves the complete state and event history of a session.
        """
        # Find user_id first by listing active sessions
        list_response = await self.session_service.list_sessions(app_name="expense_agent")
        user_id = None
        for session in list_response.sessions:
            if session.id == session_id:
                user_id = session.user_id
                break

        if not user_id:
            # Fallback default if not found
            user_id = "cli-user"

        try:
            sess = await self.session_service.get_session(
                app_name="expense_agent",
                session_id=session_id,
                user_id=user_id
            )

            # Format event objects for JSON serialization
            serialized_events = []
            for ev in sess.events:
                serialized_events.append(ev.model_dump(mode="json"))

            return {
                "session_id": sess.id,
                "user_id": sess.user_id,
                "last_update_time": sess.last_update_time,
                "state": sess.state,
                "events": serialized_events
            }
        except Exception as e:
            print(f"Error getting session details for {session_id}: {e}")
            return None

    async def resume_session(self, session_id: str, action: str) -> Dict[str, Any]:
        """
        Resumes a paused session by sending the human decision ("approve" or "reject")
        to the deployed agent via the async_stream_query API.
        """
        # 1. Discover user_id associated with this session
        list_response = await self.session_service.list_sessions(app_name="expense_agent")
        user_id = None
        for session in list_response.sessions:
            if session.id == session_id:
                user_id = session.user_id
                break

        if not user_id:
            user_id = "cli-user"

        # 2. Invoke async_stream_query with the action payload to resume execution
        events = []
        async for event in self.agent.async_stream_query(
            message=action,
            user_id=user_id,
            session_id=session_id
        ):
            events.append(event)

        # 3. Find the final outcomes or workflow status in the event stream
        outcome = None
        for event in reversed(events):
            # Check if there is an output payload containing the status
            output = event.get("output")
            if output and isinstance(output, dict) and "status" in output:
                outcome = output
                break
            # Also check event state_delta or workflow variables if output isn't directly matching
            state_delta = event.get("actions", {}).get("state_delta", {})
            if state_delta and "outcome" in state_delta:
                outcome = state_delta["outcome"]
                break

        return {
            "status": "success",
            "session_id": session_id,
            "action_submitted": action,
            "outcome": outcome or {"status": "Resumed", "method": "Manual decision submitted"}
        }
