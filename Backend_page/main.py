print("-> 1. Starting to run Python main file...")

from app import create_app
from app.init_db import create_tables
from waitress import serve
from flask_cors import CORS
from app.super_user.superuser_routers import create_default_superuser

print("-> 2. All imports were successful!")

app = create_app()
CORS(app)

# Automatically create tables
with app.app_context():
    print("-> 3. Checking the MySQL Database...")
    create_tables()
    create_default_superuser()
    print("-> 4. Database tables verified correctly!")

@app.route("/")
def home():
    return "Flask Running!"

if __name__ == "__main__":
    print("-> 5. Server starting at 0.0.0.0:5001 ...")
    app.run(host="0.0.0.0", port=5001, debug=True, threaded=True)