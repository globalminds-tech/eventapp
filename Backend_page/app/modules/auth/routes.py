from flask import Blueprint, request, jsonify
from app.modules.auth.service import AuthService

auth_module_bp = Blueprint("auth_module", __name__)

@auth_module_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "visitor")

    result = AuthService.register_user(name, email, password, role)
    if result["status"]:
        return jsonify({"message": result["message"]}), 200
    return jsonify({"message": result["message"]}), result["code"]

@auth_module_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "")
    password = data.get("password", "")

    result = AuthService.login_user(email, password)
    if result["status"]:
        return jsonify(result["data"]), 200
    return jsonify({"message": result["message"]}), result["code"]
