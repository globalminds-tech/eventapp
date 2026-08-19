class APIException(Exception):
    status_code = 500
    message = "An unexpected error occurred."

    def __init__(self, message=None, status_code=None, payload=None):
        super().__init__()
        if message is not None:
            self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

class NotFoundException(APIException):
    status_code = 404
    message = "Resource not found."

class UnauthorizedException(APIException):
    status_code = 401
    message = "Unauthorized access."

class ForbiddenException(APIException):
    status_code = 403
    message = "Forbidden access."

class BadRequestException(APIException):
    status_code = 400
    message = "Bad request."

class ValidationError(APIException):
    status_code = 422
    message = "Validation error."

class BookingConflictException(APIException):
    status_code = 409
    message = "Booking resource conflict."

class PaymentException(APIException):
    status_code = 402
    message = "Payment error."

class TenantAccessError(APIException):
    status_code = 403
    message = "Cross-tenant access forbidden."
