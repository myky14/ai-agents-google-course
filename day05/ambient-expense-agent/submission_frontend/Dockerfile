FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first for better layer caching
COPY pyproject.toml .

# Install all project dependencies (no build isolation, just deps)
RUN pip install --no-cache-dir \
    "fastapi>=0.110.0" \
    "uvicorn>=0.28.0" \
    "jinja2>=3.1.3" \
    "python-dotenv>=1.0.1" \
    "python-multipart>=0.0.9" \
    "pydantic>=2.6.4" \
    "google-adk[gcp]>=2.0.0,<3.0.0" \
    "google-cloud-aiplatform[agent-engines]>=1.44.0" \
    "httpx>=0.27.0"

# Copy application source after dependencies are installed
COPY . ./submission_frontend/

# Expose Cloud Run default port
EXPOSE 8080

# Start application (exec form — no shell expansion issues)
CMD ["uvicorn", "submission_frontend.main:app", "--host", "0.0.0.0", "--port", "8080"]
