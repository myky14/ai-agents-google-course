import os
import json
import asyncio
from pathlib import Path

# Force Google AI Studio API key usage for local dev to avoid DefaultCredentialsError
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

from expense_agent.agent import app, detect_prompt_injection
from google.adk.runners import InMemoryRunner
from google.genai import types

def map_to_agent_event(event):
    if not event.content:
        return None

    parts_list = []
    for part in event.content.parts:
        part_dict = {}
        if part.text:
            part_dict["text"] = part.text
        if part.function_call:
            fc = part.function_call
            args = fc.args
            if hasattr(args, "model_dump"):
                args = args.model_dump()
            part_dict["function_call"] = {
                "name": fc.name,
                "args": args,
            }
            if fc.id:
                part_dict["function_call"]["id"] = fc.id
        if part.function_response:
            fr = part.function_response
            response = fr.response
            if hasattr(response, "model_dump"):
                response = response.model_dump()
            part_dict["function_response"] = {
                "name": fr.name,
                "response": response,
            }
        parts_list.append(part_dict)

    author = event.author
    if author == "model":
        author = "expense_approval_workflow"

    return {
        "author": author or "expense_approval_workflow",
        "content": {
            "role": event.content.role or "model",
            "parts": parts_list
        }
    }

def build_turns(events):
    turns = []
    current_events = []
    turn_index = 0
    for e in events:
        m = map_to_agent_event(e)
        if not m:
            continue
        if m["author"] == "user":
            if current_events:
                turns.append({
                    "turn_index": turn_index,
                    "events": current_events
                })
                turn_index += 1
                current_events = []
        current_events.append(m)
    if current_events:
        turns.append({
            "turn_index": turn_index,
            "events": current_events
        })
    return turns

def get_final_response(events):
    for e in reversed(events):
        if e.content and e.content.role == "model":
            text_parts = [p.text for p in e.content.parts if p.text]
            if text_parts:
                return {
                    "role": "model",
                    "parts": [{"text": "".join(text_parts)}]
                }
    return None

async def run_scenario(case_id, payload, runner):
    user_id = f"eval_user_{case_id}"
    session = await runner.session_service.create_session(
        app_name="expense_agent", user_id=user_id
    )

    is_interrupted = False

    # Turn 0: Send expense payload
    print(f"[{case_id}] Running initial turn...")
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session.id,
        new_message=types.Content(role="user", parts=[types.Part.from_text(text=json.dumps(payload))]),
    ):
        if event.content:
            for part in event.content.parts:
                if part.function_call and part.function_call.name == "adk_request_input":
                    is_interrupted = True

    # Turn 1: If human approval required, automate the decision
    if is_interrupted:
        description = payload.get("description", "")
        if detect_prompt_injection(description):
            decision = "reject"
            print(f"[{case_id}] Prompt injection detected. Automatically REJECTING.")
        else:
            decision = "approve"
            print(f"[{case_id}] Clean request. Automatically APPROVING.")

        decision_payload = {"human_decision": decision}
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session.id,
            new_message=types.Content(role="user", parts=[types.Part.from_text(text=json.dumps(decision_payload))]),
        ):
            pass

    # Retrieve complete session events
    refreshed_session = await runner.session_service.get_session(
        app_name="expense_agent", session_id=session.id, user_id=user_id
    )
    return refreshed_session.events

async def main():
    dataset_path = Path("tests/eval/datasets/basic-dataset.json")
    output_path = Path("artifacts/traces/generated_traces.json")

    if not dataset_path.exists():
        print(f"Dataset path {dataset_path} does not exist.")
        return

    print(f"Loading dataset from {dataset_path}...")
    with open(dataset_path, encoding="utf-8") as f:
        data = json.load(f)

    cases = data.get("eval_cases", [])
    print(f"Loaded {len(cases)} cases. Starting trace generation...")

    runner = InMemoryRunner(app=app)
    generated_cases = []

    for case in cases:
        case_id = case["eval_case_id"]
        prompt_text = case["prompt"]["parts"][0]["text"]
        payload = json.loads(prompt_text)

        events = await run_scenario(case_id, payload, runner)
        turns = build_turns(events)

        case_dict = {
            "eval_case_id": case_id,
            "prompt": case["prompt"],
            "responses": [],
            "agent_data": {
                "agents": {
                    "expense_approval_workflow": {
                        "agent_id": "expense_approval_workflow",
                        "instruction": "An ambient agent that automatically approves low-value expenses and triggers human approval with AI risk reviews for high-value ones."
                    },
                    "risk_reviewer": {
                        "agent_id": "risk_reviewer",
                        "instruction": "You are an AI risk assessor checking expense reports."
                    }
                },
                "turns": turns
            }
        }

        final_resp = get_final_response(events)
        if final_resp:
            case_dict["responses"] = [{"response": final_resp}]

        generated_cases.append(case_dict)

    output_data = {"eval_cases": generated_cases}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully wrote {len(generated_cases)} traces to {output_path}")

if __name__ == "__main__":
    asyncio.run(main())
