from functools import wraps

def enforce_tenant_isolation(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated

