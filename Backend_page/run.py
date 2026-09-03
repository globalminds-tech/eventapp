import os
import sys
import subprocess

# Auto-switch to venv Python if launched using global Python
venv_python = os.path.abspath(os.path.join(os.path.dirname(__file__), "venv", "Scripts", "python.exe"))
if os.path.exists(venv_python) and sys.executable.lower() != venv_python.lower():
    sys.exit(subprocess.call([venv_python] + sys.argv))

# Configure sys.pycache_prefix so Python stores all bytecode in .python_cache
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
cache_dir = os.path.join(workspace_root, ".python_cache")
os.makedirs(cache_dir, exist_ok=True)
sys.pycache_prefix = cache_dir
os.environ["PYTHONPYCACHEPREFIX"] = cache_dir


import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
