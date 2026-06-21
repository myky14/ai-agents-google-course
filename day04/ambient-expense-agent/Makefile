# Makefile for ADK 2.0 Expense Agent

.PHONY: install playground test run

install:
	uv sync --all-extras
	uv tool install google-agents-cli

playground:
	uv run python expense_agent/fast_api_app.py

run:
	uv run python expense_agent/fast_api_app.py

test:
	uv run pytest tests/unit

generate-traces:
	uv run python tests/eval/generate_traces.py

grade:
	uvx google-agents-cli eval grade --traces artifacts/traces/generated_traces.json --config tests/eval/eval_config.yaml

