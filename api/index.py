import os
import sys

# main.py and its sibling modules (routes_*.py, *_engine.py, etc.) all live at
# the project root, one level up from this api/ directory — add it to
# sys.path so `from main import app` (and main.py's own sibling imports)
# resolve the same way they do when run locally with `uvicorn main:app`.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app  # noqa: E402

__all__ = ["app"]
