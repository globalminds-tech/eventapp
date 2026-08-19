from functools import wraps
from flask import request
from app.common.exceptions import TenantAccessError

def enforce_tenant_isolation(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        tenant_id = getattr(request, 'tenant_id', None)
        if not tenant_id and hasattr(request, 'current_user'):
            tenant_id = request.current_user.get('organization_id')
            request.tenant_id = tenant_id
        return f(*args, **kwargs)
    return decorated
