from functools import wraps
from flask import request, jsonify, current_app
import jwt

def jwt_required_middleware(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({"status": False, "message": "Token is missing"}), 401
            
        try:
            secret = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"status": False, "message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": False, "message": "Invalid token"}), 401
            
        return f(*args, **kwargs)
    return decorated
