import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions.database import db
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app('development')

def seed_database():
    with app.app_context():
        print("Seeding database...")
        db.create_all()

        email = "organizer@example.com"
        existing = db.session.query(User).filter_by(email=email).first()
        if not existing:
            organizer = User(
                name="Demo Organizer",
                email=email,
                password=generate_password_hash("password123"),
                role="organizer"
            )
            db.session.add(organizer)
            db.session.commit()
            print("Demo organizer created successfully.")
        else:
            print("Demo organizer already exists.")

if __name__ == "__main__":
    seed_database()
