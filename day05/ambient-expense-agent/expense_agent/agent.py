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

import base64
import json
import os
import re
from pydantic import BaseModel, Field

from google.adk.workflow import Workflow, START
from google.adk.agents import Agent
from google.adk.events.event import Event
from google.adk.events.request_input import RequestInput
from google.adk.agents.context import Context
from google.adk.apps import App, ResumabilityConfig
from google.genai import types

from expense_agent.config import APPROVAL_THRESHOLD, MODEL_NAME

# Setup project environment variable overrides dynamically based on configuration
try:
    if os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() == "true":
        import google.auth
        _, project_id = google.auth.default()
        if not os.environ.get("GOOGLE_CLOUD_PROJECT"):
            os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
        if not os.environ.get("GOOGLE_CLOUD_LOCATION"):
            os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
except Exception:
    pass


class RiskReview(BaseModel):
    risk_score: int = Field(description="Risk score from 1 to 5, where 1 is low risk and 5 is high risk")
    risk_factors: list[str] = Field(description="List of identified risk factors or red flags in the expense report")
    explanation: str = Field(description="Detailed explanation of the risk assessment")


def parse_expense(ctx: Context, node_input) -> Event:
    """Parses incoming expense data (handling base64 or plain JSON) and routes accordingly."""
    text_content = ""
    if isinstance(node_input, str):
        text_content = node_input
    elif isinstance(node_input, dict):
        text_content = json.dumps(node_input)
    elif hasattr(node_input, "parts") and node_input.parts:
        text_content = node_input.parts[0].text
    elif hasattr(node_input, "text") and node_input.text:
        text_content = node_input.text
    else:
        text_content = str(node_input)

    text_content = text_content.strip()

    # Check if the input is a human decision response for a pending review
    is_decision = False
    decision_val = None
    try:
        if text_content.startswith("{"):
            parsed = json.loads(text_content)
            if isinstance(parsed, dict) and "human_decision" in parsed:
                is_decision = True
                decision_val = parsed["human_decision"]
        elif text_content.lower() in ["approve", "reject"]:
            is_decision = True
            decision_val = text_content
    except Exception:
        pass

    if is_decision and ctx.state.get("expense"):
        expense = ctx.state["expense"]
        return Event(
            output=expense,
            route="resume_decision",
            state={
                "human_decision": decision_val
            }
        )

    # Attempt to load the JSON payload
    try:
        payload = json.loads(text_content)
    except json.JSONDecodeError:
        try:
            # Maybe the whole text is a base64 encoded JSON string
            decoded = base64.b64decode(text_content).decode("utf-8")
            payload = json.loads(decoded)
        except Exception:
            payload = {"description": text_content, "amount": 0.0}

    # Extract the nested "data" if present (Pub/Sub structure)
    data = None
    if isinstance(payload, dict):
        if "data" in payload:
            raw_data = payload["data"]
            if isinstance(raw_data, str):
                try:
                    # Pub/Sub payload is base64 encoded
                    decoded_bytes = base64.b64decode(raw_data)
                    data = json.loads(decoded_bytes.decode("utf-8"))
                except Exception:
                    try:
                        data = json.loads(raw_data)
                    except Exception:
                        data = {"description": raw_data}
            elif isinstance(raw_data, dict):
                data = raw_data
        else:
            data = payload
    else:
        data = {"description": str(payload)}

    # Standardize expense details
    amount_raw = data.get("amount")
    amount = 0.0
    if amount_raw is not None:
        try:
            amount = float(amount_raw)
        except (ValueError, TypeError):
            amount = 0.0

    expense = {
        "amount": amount,
        "submitter": data.get("submitter", "Unknown"),
        "category": data.get("category", "Uncategorized"),
        "description": data.get("description", "No description"),
        "date": data.get("date", "Unknown"),
    }

    formatted = (
        f"Submitter: {expense['submitter']}\n"
        f"Amount: ${expense['amount']:.2f}\n"
        f"Category: {expense['category']}\n"
        f"Description: {expense['description']}\n"
        f"Date: {expense['date']}"
    )

    # All new expenses must go through the security checkpoint first
    route = "needs_review"

    return Event(
        output=expense,
        route=route,
        state={
            "expense": expense,
            "formatted_expense": formatted
        }
    )


def auto_approve(ctx: Context, node_input: dict):
    """Handles expenses under the approval threshold by auto-approving instantly."""
    expense = ctx.state.get("expense", node_input)
    outcome = {
        "status": "Approved",
        "method": "Auto-Approved",
        "expense": expense,
    }

    msg = (
        f"⚡ **Auto-Approved**\n"
        f"Submitter: {expense.get('submitter')}\n"
        f"Amount: ${expense.get('amount'):.2f}\n"
        f"Category: {expense.get('category')}\n"
        f"Description: {expense.get('description')}\n"
        f"Date: {expense.get('date')}\n\n"
        f"Status: Approved instantly (amount is under ${APPROVAL_THRESHOLD:.2f})."
    )

    yield Event(content=types.Content(role="model", parts=[types.Part.from_text(text=msg)]))
    yield Event(output=outcome)


def scrub_pii(text: str) -> tuple[str, list[str]]:
    """Scrubs SSNs and Credit Cards from the text. Validates CC using Luhn."""
    redacted_categories = []

    # 1. SSN Scrubbing
    # Matches XXX-XX-XXXX or raw 9 digits (XXXXXXXXX)
    ssn_pattern = r'\b\d{3}[- ]\d{2}[- ]\d{4}\b|\b\d{9}\b'
    scrubbed = text

    if re.search(ssn_pattern, scrubbed):
        scrubbed = re.sub(ssn_pattern, "[REDACTED SSN]", scrubbed)
        redacted_categories.append("SSN")

    # 2. Credit Card Scrubbing
    # Matches common digit sequences with optional hyphens/spaces
    # E.g. Visa/MC/Amex/Discover, total digit count 13-19
    def is_luhn_valid(n_str: str) -> bool:
        digits = [int(c) for c in n_str if c.isdigit()]
        if len(digits) < 13 or len(digits) > 19:
            return False
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        checksum = sum(odd_digits)
        for d in even_digits:
            checksum += sum(divmod(d * 2, 10))
        return checksum % 10 == 0

    # Potential CCs: starts with a digit, followed by 12-18 digits with optional space/hyphen separators
    potential_cc_pattern = r'\b\d(?:[ -]?\d){12,18}\b'

    cc_found = False

    def cc_replacer(match):
        nonlocal cc_found
        matched_str = match.group(0)
        if is_luhn_valid(matched_str):
            cc_found = True
            return "[REDACTED CREDIT CARD]"
        return matched_str

    scrubbed = re.sub(potential_cc_pattern, cc_replacer, scrubbed)
    if cc_found:
        redacted_categories.append("Credit Card")

    return scrubbed, redacted_categories


def detect_prompt_injection(text: str) -> bool:
    """Detects instruction-stuffed prompt injection attempts in the description."""
    injection_keywords = [
        "ignore previous instructions",
        "ignore all instructions",
        "ignore rules",
        "bypass rules",
        "force auto-approval",
        "force approval",
        "auto-approve",
        "auto approve",
        "override policy",
        "override guidelines",
        "system prompt",
        "you are now",
        "do not check",
        "skip verification",
        "bypass the rules",
        "override rules",
        "approve this expense",
        "bypass threshold",
        "ignore threshold",
    ]

    text_lower = text.lower()
    for keyword in injection_keywords:
        if keyword in text_lower:
            return True
    return False


def security_checkpoint(ctx: Context, node_input: dict) -> Event:
    """Security checkpoint that scrubs PII and checks for prompt injection."""
    expense = ctx.state.get("expense", node_input).copy()
    description = expense.get("description", "")

    # 1. Scrub PII
    scrubbed_desc, redacted_categories = scrub_pii(description)
    expense["description"] = scrubbed_desc

    # Re-generate the formatted expense so LLM prompts use the scrubbed version
    formatted = (
        f"Submitter: {expense.get('submitter', 'Unknown')}\n"
        f"Amount: ${expense.get('amount', 0.0):.2f}\n"
        f"Category: {expense.get('category', 'Uncategorized')}\n"
        f"Description: {expense['description']}\n"
        f"Date: {expense.get('date', 'Unknown')}"
    )

    # 2. Defend against prompt injection
    if detect_prompt_injection(description):
        # Flag as a security event and bypass risk reviewer LLM
        risk_review = {
            "risk_score": 5,
            "risk_factors": ["Security Flag: Prompt Injection Detected"],
            "explanation": "This expense was flagged by the security checkpoint due to a potential prompt injection attack in the description. The LLM reviewer was bypassed for security reasons."
        }

        return Event(
            output=expense,
            route="flagged",
            state={
                "expense": expense,
                "formatted_expense": formatted,
                "redacted_categories": redacted_categories,
                "security_event": True,
                "risk_review": risk_review
            }
        )

    # All clean expenses are checked for the threshold rule here
    route = "auto_approve" if expense.get("amount", 0.0) < APPROVAL_THRESHOLD else "clean"

    return Event(
        output=expense,
        route=route,
        state={
            "expense": expense,
            "formatted_expense": formatted,
            "redacted_categories": redacted_categories,
            "security_event": False
        }
    )


risk_reviewer = Agent(
    name="risk_reviewer",
    model=MODEL_NAME,
    instruction="""
    You are an AI risk assessor checking expense reports.
    Analyze the following expense details for potential policy violations, suspicious amounts, or other risk factors:

    {formatted_expense}

    Provide a structured risk review following the output schema.
    """,
    output_schema=RiskReview,
    output_key="risk_review",
)


def emit_expense_alert(ctx: Context, node_input: dict):
    """Emits a visible alert message in the workflow for expenses requiring human review."""
    expense = ctx.state.get("expense", node_input)
    risk_review = ctx.state.get("risk_review", {})

    if hasattr(risk_review, "model_dump"):
        risk_review = risk_review.model_dump()

    risk_factors_str = ", ".join(risk_review.get("risk_factors", [])) if isinstance(risk_review.get("risk_factors"), list) else str(risk_review.get("risk_factors", ""))

    msg = (
        f"⚠️ **Action Required: Expense Review Alert**\n"
        f"An expense of **${expense.get('amount'):.2f}** submitted by **{expense.get('submitter')}** requires approval.\n"
        f"Description: {expense.get('description')}\n"
        f"Category: {expense.get('category')}\n"
        f"Date: {expense.get('date')}\n\n"
        f"**AI Risk Analysis:**\n"
        f"- Risk Score: {risk_review.get('risk_score')}/5\n"
        f"- Risk Factors: {risk_factors_str}\n"
        f"- Explanation: {risk_review.get('explanation')}"
    )

    yield Event(content=types.Content(role="model", parts=[types.Part.from_text(text=msg)]))
    yield Event(output={"expense": expense, "risk_review": risk_review})


async def human_approval_gate(ctx: Context, node_input: dict | str | None = None):
    """Pauses the workflow for human approval/rejection."""
    risk_review = ctx.state.get("risk_review", {})
    expense = ctx.state.get("expense", {})

    decision = None
    if ctx.resume_inputs and "human_decision" in ctx.resume_inputs:
        decision = ctx.resume_inputs["human_decision"]
    elif ctx.state.get("human_decision"):
        decision = ctx.state["human_decision"]

    if isinstance(decision, dict) and "human_decision" in decision:
        decision = decision["human_decision"]

    if not decision:
        # If it was a security event (which bypasses risk_reviewer and emit_expense_alert),
        # we generate the detailed warning message here.
        if ctx.state.get("security_event", False):
            if hasattr(risk_review, "model_dump"):
                risk_review = risk_review.model_dump()
            risk_factors_str = ", ".join(risk_review.get("risk_factors", [])) if isinstance(risk_review.get("risk_factors"), list) else str(risk_review.get("risk_factors", ""))
            msg = (
                f"🚨 **Security Alert: Expense Flagged**\n"
                f"An expense of **${expense.get('amount'):.2f}** submitted by **{expense.get('submitter')}** was flagged for security review.\n"
                f"Description: {expense.get('description')}\n"
                f"Category: {expense.get('category')}\n"
                f"Date: {expense.get('date')}\n\n"
                f"**AI Risk Analysis:**\n"
                f"- Risk Score: {risk_review.get('risk_score')}/5\n"
                f"- Risk Factors: {risk_factors_str}\n"
                f"- Explanation: {risk_review.get('explanation')}\n\n"
                f"Please reply with 'approve' or 'reject' to make your decision."
            )
        else:
            msg = "Please reply with 'approve' or 'reject' to make your decision."

        yield RequestInput(
            interrupt_id="human_decision",
            message=msg
        )
        return

    yield Event(
        output={"decision": decision, "risk_review": risk_review},
        state={"human_decision": decision}
    )


def record_outcome(ctx: Context, node_input: dict):
    """Records the final decision outcome from the human reviewer."""
    expense = ctx.state.get("expense", {})
    decision = ctx.state.get("human_decision", "Rejected")
    risk_review = ctx.state.get("risk_review", {})

    is_approved = "approve" in str(decision).lower()
    status = "Approved" if is_approved else "Rejected"

    outcome = {
        "status": status,
        "method": "Human Review",
        "expense": expense,
        "risk_review": risk_review,
        "decision": decision
    }

    msg = (
        f"✅ **Process Completed**\n"
        f"Expense submitted by **{expense.get('submitter')}** for **${expense.get('amount'):.2f}** has been **{status}** via Human Review.\n"
        f"Decision details: {decision}"
    )

    yield Event(content=types.Content(role="model", parts=[types.Part.from_text(text=msg)]))
    yield Event(output=outcome)


# ADK 2.0 graph workflow definition
root_agent = Workflow(
    name="expense_approval_workflow",
    edges=[
        ('START', parse_expense),
        (parse_expense, {
            "needs_review": security_checkpoint,
            "resume_decision": human_approval_gate
        }),
        (security_checkpoint, {
            "auto_approve": auto_approve,
            "clean": risk_reviewer,
            "flagged": human_approval_gate
        }),
        (risk_reviewer, emit_expense_alert),
        (emit_expense_alert, human_approval_gate),
        (human_approval_gate, record_outcome),
    ],
    description="An ambient agent that automatically approves low-value expenses and triggers human approval with AI risk reviews for high-value ones.",
)


app = App(
    root_agent=root_agent,
    name="expense_agent",
    resumability_config=ResumabilityConfig(is_resumable=True),
)
