import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Threshold for auto-approval of expenses (under this amount is auto-approved)
APPROVAL_THRESHOLD = float(os.getenv("APPROVAL_THRESHOLD", "100.0"))

# Gemini Model name to be used for risk evaluation
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.1-flash-lite")
