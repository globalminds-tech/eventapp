from functools import wraps
from flask import request, jsonify, current_app
import jwt

def role_required(required_role):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return jsonify({"status": False, "message": "Authorization header missing"}), 401

            parts = auth_header.split()
            if len(parts) != 2 or parts[0] != "Bearer":
                return jsonify({"status": False, "message": "Invalid authorization format"}), 401

            token = parts[1]
            try:
                secret = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
                decoded = jwt.decode(token, secret, algorithms=["HS256"])
                user_id = decoded.get("user_id") or decoded.get("id")
                user_role = decoded.get("role")
            except jwt.ExpiredSignatureError:
                return jsonify({"status": False, "message": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"status": False, "message": "Invalid token"}), 401

            if required_role and user_role != required_role:
                return jsonify({"status": False, "message": "Access denied"}), 403

            request.user_id = user_id
            request.user_role = user_role
            return func(*args, **kwargs)
        return wrapper
    return decorator