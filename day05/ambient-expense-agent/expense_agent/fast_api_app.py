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
import os
import json
import logging
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app

from expense_agent.app_utils.telemetry import setup_telemetry
from expense_agent.app_utils.typing import Feedback

# Setup standard python logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

setup_telemetry()

allow_origins = (
    os.getenv("ALLOW_ORIGINS", "").split(",") if os.getenv("ALLOW_ORIGINS") else None
)

# Artifact bucket for ADK (created by Terraform, passed via env var)
logs_bucket_name = os.environ.get("LOGS_BUCKET_NAME")

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# In-memory session configuration - no persistent storage
session_service_uri = None

artifact_service_uri = f"gs://{logs_bucket_name}" if logs_bucket_name else None

app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    artifact_service_uri=artifact_service_uri,
    allow_origins=allow_origins,
    session_service_uri=session_service_uri,
    otel_to_cloud=False,
    trigger_sources=["pubsub"],
)
app.title = "ambient-expense-agent"
app.description = "API for interacting with the Agent ambient-expense-agent"


# Middleware to normalize fully-qualified Pub/Sub subscription path to short subscription name
class PubSubNormalizationMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["method"] == "POST" and scope["path"].endswith("/trigger/pubsub"):
            async def custom_receive():
                message = await receive()
                if message.get("type") == "http.request":
                    body = message.get("body", b"")
                    try:
                        data = json.loads(body)
                        if isinstance(data, dict) and "subscription" in data:
                            sub_path = data["subscription"]
                            if "/" in sub_path:
                                data["subscription"] = sub_path.split("/")[-1]
                            message["body"] = json.dumps(data).encode("utf-8")
                    except Exception:
                        pass
                return message

            await self.app(scope, custom_receive, send)
        else:
            await self.app(scope, receive, send)


app.add_middleware(PubSubNormalizationMiddleware)


@app.post("/feedback")
def collect_feedback(feedback: Feedback) -> dict[str, str]:
    """Collect and log feedback.

    Args:
        feedback: The feedback data to log

    Returns:
        Success message
    """
    logger.info("Feedback collected: %s", feedback.model_dump())
    return {"status": "success"}


# Main execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
