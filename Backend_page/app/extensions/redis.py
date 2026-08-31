import os
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

try:
    import redis
except ImportError:
    redis = None

class RedisCache:
    def __init__(self):
        self.client = None
        self._connect()

    def _connect(self):
        if redis is None:
            logger.warning("redis-py is not installed. Caching disabled.")
            return

        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            logger.info("REDIS_URL not set. Running without Redis cache.")
            return

        try:
            self.client = redis.Redis.from_url(
                redis_url,
                decode_responses=True,
                socket_timeout=0.5,
                socket_connect_timeout=0.5
            )
            self.client.ping()
            logger.info("Connected to Redis / Upstash successfully.")
        except Exception as e:
            logger.warning(f"Could not connect to Redis ({e}). Continuing without cache.")
            self.client = None

    def get_json(self, key: str) -> Optional[Any]:
        if not self.client:
            return None
        try:
            val = self.client.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.warning(f"Redis GET failed for key {key}: {e}")
            return None

    def set_json(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        if not self.client:
            return False
        try:
            serialized = json.dumps(value)
            self.client.set(key, serialized, ex=expire_seconds)
            return True
        except Exception as e:
            logger.warning(f"Redis SET failed for key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Redis DELETE failed for key {key}: {e}")
            return False

    def clear_pattern(self, pattern: str) -> int:
        if not self.client:
            return 0
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
        except Exception as e:
            logger.warning(f"Redis clear pattern failed: {e}")
        return 0

redis_cache = RedisCache()
redis_client = redis_cache
