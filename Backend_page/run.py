import os
import sys

# Configure sys.pycache_prefix so Python stores all bytecode in .python_cache
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
cache_dir = os.path.join(workspace_root, ".python_cache")
os.makedirs(cache_dir, exist_ok=True)
sys.pycache_prefix = cache_dir
os.environ["PYTHONPYCACHEPREFIX"] = cache_dir

from app import create_app

app = create_app(os.environ.get("FLASK_ENV", "development"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
