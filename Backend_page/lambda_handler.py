import os
from app import create_app

app = create_app(os.environ.get("FLASK_ENV", "production"))

def handler(event, context):
    try:
        import serverless_wsgi
        return serverless_wsgi.handle_request(app, event, context)
    except ImportError:
        raise NotImplementedError("serverless_wsgi package is required for AWS Lambda execution context.")
