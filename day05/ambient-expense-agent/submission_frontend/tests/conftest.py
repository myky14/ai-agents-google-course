import os
import sys

# Ensure submission_frontend is in sys.path so imports like 'services' resolve correctly.
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if frontend_dir not in sys.path:
    sys.path.insert(0, frontend_dir)
