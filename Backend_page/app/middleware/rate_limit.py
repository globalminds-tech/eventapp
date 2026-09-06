import time
import logging
import threading
from collections import defaultdict
from typing import Optional, Tuple
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.extensions.redis import redis_client

logger = logging.getLogger("rate_limit")

# Thread-safe in-memory sliding window fallback
_in_memory_store = defaultdict(list)
_store_lock = threading.Lock()

# Route rule configurations: (path_prefix, method, max_requests, window_seconds, rule_name)
RATE_LIMIT_RULES = [
    # Sensitive Auth & Abuse Targets
    ("/api/v1/auth/login", "POST", 5, 60, "auth_login"),
    ("/api/auth/login", "POST", 5, 60, "legacy_auth_login"),
    ("/api/v1/auth/otp/send", "POST", 3, 300, "otp_send"),
    ("/api/v1/auth/otp/resend", "POST", 3, 300, "otp_resend"),
    ("/api/v1/auth/otp/verify", "POST", 5, 300, "otp_verify"),
    ("/api/v1/auth/reset-password", "POST", 3, 300, "auth_reset_pwd"),
    ("/api/v1/rbac/team/invite", "POST", 10, 60, "team_invite"),
    
    # Global Default Fallback for API
    ("/api/", "*", 120, 60, "general_api"),
]

def get_client_ip(request: Request) -> str:
    """Extract real client IP considering forward proxies (Cloudflare, Nginx, ALB)."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # First IP in comma-separated chain is original client
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
        
    return request.client.host if request.client else "127.0.0.1"


def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
    """
    Sliding window rate limiter.
    Returns (is_allowed: bool, retry_after_seconds: int).
    Tries Redis first; falls back smoothly to in-memory store.
    """
    now = time.time()

    # 1. Try Redis Cluster / Upstash if active
    if redis_client and redis_client.client:
        try:
            r = redis_client.client
            pipe = r.pipeline()
            window_start = now - window_seconds
            redis_key = f"rate:{key}"

            # Remove timestamps outside current window
            pipe.zremrangebyscore(redis_key, 0, window_start)
            # Count remaining timestamps in window
            pipe.zcard(redis_key)
            # Retrieve oldest timestamp to calculate accurate retry_after
            pipe.zrange(redis_key, 0, 0, withscores=True)
            results = pipe.execute()

            current_count = results[1]
            oldest_entries = results[2]

            if current_count >= max_requests:
                oldest_ts = oldest_entries[0][1] if oldest_entries else (now - window_seconds)
                retry_after = max(1, int(window_seconds - (now - oldest_ts)))
                return False, retry_after

            # Add current request timestamp
            pipe = r.pipeline()
            pipe.zadd(redis_key, {f"{now}:{time.time_ns()}": now})
            pipe.expire(redis_key, window_seconds + 10)
            pipe.execute()

            return True, 0
        except Exception as redis_err:
            logger.warning(f"[RateLimit] Redis check failed ({redis_err}), using in-memory fallback.")

    # 2. In-Memory Sliding Window Fallback
    with _store_lock:
        window_start = now - window_seconds
        timestamps = _in_memory_store[key]

        # Purge stale timestamps
        _in_memory_store[key] = [ts for ts in timestamps if ts > window_start]
        active_timestamps = _in_memory_store[key]

        if len(active_timestamps) >= max_requests:
            oldest_ts = active_timestamps[0]
            retry_after = max(1, int(window_seconds - (now - oldest_ts)))
            return False, retry_after

        _in_memory_store[key].append(now)

        # Periodic cleanup if memory store grows large
        if len(_in_memory_store) > 10000:
            stale_keys = [k for k, v in _in_memory_store.items() if not v or v[-1] < window_start]
            for sk in stale_keys:
                _in_memory_store.pop(sk, None)

        return True, 0


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    High-performance middleware protecting critical API endpoints against brute-force and DDoS.
    Exempts static files, Swagger/OpenAPI docs, and OPTIONS preflight requests.
    """
    async def dispatch(self, request: Request, call_next):
        # Always allow CORS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        method = request.method

        # Skip documentation and static endpoints
        if path.startswith(("/docs", "/redoc", "/openapi.json", "/uploads", "/static")):
            return await call_next(request)

        # Find matching rule
        matched_rule = None
        for rule_path, rule_method, max_req, window_sec, rule_name in RATE_LIMIT_RULES:
            if (rule_method == "*" or rule_method == method) and path.startswith(rule_path):
                matched_rule = (max_req, window_sec, rule_name)
                break

        if matched_rule:
            max_req, window_sec, rule_name = matched_rule
            client_ip = get_client_ip(request)
            rate_key = f"{rule_name}:{client_ip}"

            try:
                allowed, retry_after = check_rate_limit(rate_key, max_req, window_sec)
                if not allowed:
                    logger.warning(
                        f"[RateLimit 429] IP {client_ip} exceeded limit on {path} "
                        f"({max_req} req/{window_sec}s). Cooldown: {retry_after}s"
                    )
                    return JSONResponse(
                        status_code=429,
                        headers={
                            "Retry-After": str(retry_after),
                            "X-RateLimit-Limit": str(max_req),
                            "X-RateLimit-Reset": str(retry_after),
                            "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
                            "Access-Control-Allow-Credentials": "true",
                        },
                        content={
                            "success": False,
                            "detail": f"Too many requests. Please slow down and try again in {retry_after} second{'s' if retry_after != 1 else ''}.",
                            "retry_after": retry_after
                        }
                    )
            except Exception as ex:
                # Never break requests if rate limiter has internal exception
                logger.error(f"[RateLimit Error] {ex}")

        # Continue with request
        response = await call_next(request)
        return response
