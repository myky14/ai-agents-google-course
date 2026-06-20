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

from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk import Workflow, Context, Event
from google.genai import types
from pydantic import BaseModel, Field

# Define Gemini model configuration
shared_model = Gemini(
    model="gemini-flash-latest",
    retry_options=types.HttpRetryOptions(attempts=3),
)

# Pydantic model for classification output
class ClassificationResult(BaseModel):
    is_shipping_related: bool = Field(
        description="True if the user's query is related to shipping (such as rates, tracking, delivery, returns). False otherwise."
    )

# 1. Start node: Extracts and stores user query in state
def start_processing(node_input: types.Content, ctx: Context) -> Event:
    query = ""
    if node_input and node_input.parts:
        query = "".join(part.text for part in node_input.parts if part.text)
    return Event(output=query, state={"user_query": query})

# 2. Classifier Agent: Classifies the query using Gemini
classifier_agent = LlmAgent(
    name="classifier_agent",
    model=shared_model,
    instruction="""Analyze the user's query. Determine if the query is related to shipping (including rates, tracking, delivery, returns).
Respond strictly using the ClassificationResult schema.""",
    output_schema=ClassificationResult,
    output_key="classification",
)

# 3. Router Node: Routes flow based on classification result
def route_query(node_input: dict, ctx: Context) -> Event:
    is_related = node_input.get("is_shipping_related", False)
    query = ctx.state.get("user_query", "")
    if is_related:
        return Event(output=query, route="shipping")
    else:
        return Event(output=query, route="unrelated")

# 4. Shipping FAQ Agent: Answers shipping-related queries
shipping_faq_agent = LlmAgent(
    name="shipping_faq_agent",
    model=shared_model,
    instruction="""You are a super friendly and enthusiastic customer support agent for a shipping company! 🚢💨
Answer the customer's shipping-related questions (rates, tracking, delivery, returns) politely, clearly, and accurately.

When answering shipping rates questions:
- Be extra playful, energetic, and enthusiastic! 🎉
- Use fun emojis to make it lively! 🚚💸✨
- ALWAYS highlight that we offer **FREE SHIPPING** on all orders over **$50**! 🎁🤑

If you cannot answer the question or need more information, politely ask the user for details.""",
)

# 5. Decline Node: Politely declines unrelated queries
def decline_to_answer(node_input: str) -> Event:
    decline_msg = "I'm sorry, but I can only assist with shipping-related queries (such as rates, tracking, delivery, or returns). Please let me know if you have a question about those shipping topics!"
    return Event(
        output=decline_msg,
        content=types.Content(
            role="model",
            parts=[types.Part.from_text(text=decline_msg)]
        )
    )

# Construct the customer support workflow graph using RoutingMap (dict) for routing
root_agent = Workflow(
    name="customer_support_workflow",
    edges=[
        ('START', start_processing),
        (start_processing, classifier_agent),
        (classifier_agent, route_query),
        (route_query, {
            "shipping": shipping_faq_agent,
            "__DEFAULT__": decline_to_answer,
        }),
    ],
    description="Customer support representative workflow that handles shipping FAQ or declines unrelated requests.",
)

# Initialize the App container
app = App(
    root_agent=root_agent,
    name="app",
)
