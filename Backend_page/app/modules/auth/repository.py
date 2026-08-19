from app.extensions.database import db
from app.models.user import User
from sqlalchemy import select

class AuthRepository:
    @staticmethod
    def get_user_by_email(email: str):
        if not email:
            return None
        stmt = select(User).where(User.email == email.strip().lower())
        return db.session.scalar(stmt)

    @staticmethod
    def get_user_by_id(user_id: int):
        return db.session.get(User, user_id)

    @staticmethod
    def create_user(name: str, email: str, password_hash: str, role: str):
        user = User(
            name=name,
            email=email.strip().lower(),
            password=password_hash,
            role=role
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def update_password(email: str, password_hash: str):
        user = AuthRepository.get_user_by_email(email)
        if user:
            user.password = password_hash
            db.session.commit()
            return True
        return False
