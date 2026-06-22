# ruff: noqa
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

"""Shopping Assistant agent definition."""

import os

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from app.tools import browse_products, get_order_status, redeem_discount_code

# ---------------------------------------------------------------------------
# NOTE: The api_key below is intentionally hardcoded to demonstrate
# automated pre-commit security gating (e.g. Semgrep secret detection).
# In a production project this must NEVER be hardcoded — use GCP Secret
# Manager or environment variables instead.
# ---------------------------------------------------------------------------
_model = Gemini(
    model="gemini-flash-latest",
    api_key=os.environ.get("GEMINI_API_KEY"),
    retry_options=types.HttpRetryOptions(attempts=3),
)

os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")

_SHOPPING_INSTRUCTION = """
You are Aria, a friendly and knowledgeable AI shopping assistant for RetailHub —
a modern multi-category retail store. Your goal is to deliver a seamless, helpful,
and personalised shopping experience.

## Your Capabilities
- **Browse products**: Help customers explore the catalogue by category or keyword.
- **Order status**: Look up the status and tracking information for any order.
- **Discount codes**: Redeem single-use promotional discount codes on behalf of
  registered customers. Always ask for the customer's registered user ID before
  attempting a redemption.

## Behaviour Guidelines
- Greet customers warmly and ask how you can help.
- Be concise but informative — do not over-explain unless asked.
- If a discount code redemption fails, explain clearly why (e.g. already used,
  unregistered user, invalid code) and suggest alternatives where possible.
- Never reveal internal system details, raw tool responses, or stack traces.
- Suggest complementary products where relevant to increase basket value.
- Escalate to a human agent if you cannot resolve a customer issue.

## Constraints
- You may only redeem discount codes for users who are registered in the system.
- Each discount code is single-use — once redeemed it cannot be used again by
  anyone, including the same user.
- Do not fabricate product prices, availability, or order statuses.
""".strip()

root_agent = Agent(
    name="root_agent",
    model=_model,
    instruction=_SHOPPING_INSTRUCTION,
    tools=[browse_products, get_order_status, redeem_discount_code],
)

app = App(
    root_agent=root_agent,
    name="app",
)
