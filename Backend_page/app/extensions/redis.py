import redis
import logging

logger = logging.getLogger(__name__)

class RedisExtension:
    def __init__(self, app=None):
        self.client = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        redis_url = app.config.get('REDIS_URL')
        if redis_url:
            try:
                self.client = redis.Redis.from_url(redis_url, decode_responses=True)
                self.client.ping()
                logger.info("Connected to Redis successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to Redis: {e}. Running without cache.")
                self.client = None
        else:
            self.client = None

    def get(self, key):
        if self.client:
            try:
                return self.client.get(key)
            except Exception:
                return None
        return None

    def set(self, key, value, ex=None):
        if self.client:
            try:
                return self.client.set(key, value, ex=ex)
            except Exception:
                return None
        return None

    def delete(self, key):
        if self.client:
            try:
                return self.client.delete(key)
            except Exception:
                return None
        return None

redis_client = RedisExtension()
