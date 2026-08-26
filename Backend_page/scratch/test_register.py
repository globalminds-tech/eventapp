import traceback
from app import create_app
from app.modules.auth.services.auth_service import AuthService

app = create_app()

with app.app_context() if hasattr(app, 'app_context') else open(__file__):
    try:
        test_payload = {
            "name": "Test User",
            "email": "testuser_debug@example.com",
            "password": "Password123!",
            "role": "user"
        }
        res = AuthService.register_user(test_payload)
        print("Registration Success:", res)
    except Exception as e:
        print("EXACT REGISTER EXCEPTION:")
        traceback.print_exc()
