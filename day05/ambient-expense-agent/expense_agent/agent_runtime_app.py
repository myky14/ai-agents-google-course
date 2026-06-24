# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import asyncio
import json
import logging
import os
import queue
import threading
from typing import Any, Dict, Optional

import vertexai
from dotenv import load_dotenv
from google.adk.artifacts import GcsArtifactService, InMemoryArtifactService
from google.cloud import logging as google_cloud_logging
from vertexai.agent_engines.templates.adk import AdkApp

from expense_agent.agent import app as adk_app
from expense_agent.app_utils.telemetry import setup_telemetry
from expense_agent.app_utils.typing import Feedback

# Load environment variables from .env file at runtime
load_dotenv()


class AgentEngineApp(AdkApp):
    def set_up(self) -> None:
        """Initialize the agent engine app with logging and telemetry."""
        vertexai.init()
        setup_telemetry()
        super().set_up()
        logging.basicConfig(level=logging.INFO)
        logging_client = google_cloud_logging.Client()
        self.logger = logging_client.logger(__name__)
        if gemini_location:
            os.environ["GOOGLE_CLOUD_LOCATION"] = gemini_location

    def register_feedback(self, feedback: dict[str, Any]) -> None:
        """Collect and log feedback."""
        feedback_obj = Feedback.model_validate(feedback)
        self.logger.log_struct(feedback_obj.model_dump(), severity="INFO")

    async def async_process_expense(
        self,
        payload: Optional[Dict[str, Any]] = None,
        message: Optional[str] = None,
        input: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Asynchronously process the incoming Pub/Sub pushed expense payload."""
        # 1. Normalize input payload
        message_val = None
        if input is not None:
            if isinstance(input, dict):
                if "message" in input:
                    message_val = input["message"]
                else:
                    message_val = input
            else:
                message_val = input
        elif message is not None:
            message_val = message
        elif payload is not None:
            if isinstance(payload, dict):
                if "message" in payload:
                    message_val = payload["message"]
                else:
                    message_val = payload
            else:
                message_val = payload
        else:
            message_val = kwargs

        if not message_val:
            message_val = {}

        # If it's a string, attempt to parse it as JSON to see if it represents a dict
        if isinstance(message_val, str):
            try:
                parsed = json.loads(message_val)
                if isinstance(parsed, dict):
                    message_val = parsed
            except Exception:
                pass

        # Convert dictionary to JSON string so that it can be parsed by parse_expense
        if isinstance(message_val, dict):
            message_str = json.dumps(message_val)
        else:
            message_str = str(message_val)

        # 2. Extract or create session ID
        if session_id:
            try:
                await self.async_get_session(user_id="default-user", session_id=session_id)
            except Exception:
                session = await self.async_create_session(user_id="default-user")
                session_id = session["id"]
        else:
            session = await self.async_create_session(user_id="default-user")
            session_id = session["id"]

        waiting_for_human = False
        outcome = None

        # 3. Stream existing expense workflow
        async for event in self.async_stream_query(
            message=message_str,
            user_id="default-user",
            session_id=session_id
        ):
            # Check for HITL wait state
            tool_ids = event.get("long_running_tool_ids")
            if tool_ids and "human_decision" in tool_ids:
                waiting_for_human = True

            # Check for final outcome
            output = event.get("output")
            if output and isinstance(output, dict) and "status" in output:
                outcome = output

        # 4. Status determination
        if outcome:
            status = outcome.get("status", "Completed")
        elif waiting_for_human:
            status = "Pending human review"
        else:
            status = "Running"

        return {
            "session_id": session_id,
            "status": status,
            "waiting_for_human": waiting_for_human,
            "human_decision": waiting_for_human
        }

    def process_expense(
        self,
        payload: Optional[Dict[str, Any]] = None,
        message: Optional[str] = None,
        input: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Synchronously process the incoming Pub/Sub pushed expense payload."""
        event_queue = queue.Queue(maxsize=1)

        async def _invoke():
            return await self.async_process_expense(
                payload=payload,
                message=message,
                input=input,
                session_id=session_id,
                **kwargs
            )

        def _asyncio_thread_main():
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                result = loop.run_until_complete(_invoke())
                event_queue.put(result)
            except Exception as e:
                event_queue.put(e)

        thread = threading.Thread(target=_asyncio_thread_main)
        thread.start()
        thread.join()

        outcome = event_queue.get(timeout=60)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    def query(
        self,
        payload: Optional[Dict[str, Any]] = None,
        message: Optional[str] = None,
        input: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Query method for direct Reasoning Engine :query endpoint routing."""
        return self.process_expense(
            payload=payload,
            message=message,
            input=input,
            session_id=session_id,
            **kwargs
        )

    def register_operations(self) -> dict[str, list[str]]:
        """Registers the operations of the Agent."""
        operations = super().register_operations()
        operations[""] = [
            *operations.get("", []),
            "register_feedback",
            "process_expense",
            "query",
            "async_process_expense"
        ]
        return operations

    def clone(self) -> "AgentEngineApp":
        """Returns a clone of the Agent Runtime application."""
        return self


gemini_location = os.environ.get("GOOGLE_CLOUD_LOCATION")
logs_bucket_name = os.environ.get("LOGS_BUCKET_NAME")
agent_runtime = AgentEngineApp(
    app=adk_app,
    artifact_service_builder=lambda: (
        GcsArtifactService(bucket_name=logs_bucket_name)
        if logs_bucket_name
        else InMemoryArtifactService()
    ),
)
