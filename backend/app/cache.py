"""
Redis caching layer for AI Finance System.

Design goals:
- Graceful degradation: if Redis is down the app still works, just slower.
- Per-user cache keys so data never leaks between accounts.
- Centralised TTL controlled via settings.CACHE_TTL_SECONDS.

Key naming convention:
    <prefix>:<user_id>     e.g.  analytics:42  |  expenses:42  |  forecast:42
"""

import json
import logging
from typing import Any, Optional

import redis
from redis.exceptions import RedisError

from app.config import settings

logger = logging.getLogger(__name__)

# ── Connection pool (created once at import time) ─────────────────────────────
try:
    _pool = redis.ConnectionPool.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=20,
    )
    _client: Optional[redis.Redis] = redis.Redis(connection_pool=_pool)
    # Quick connectivity test
    _client.ping()
    logger.info("Redis cache connected at %s", settings.REDIS_URL)
except Exception as exc:
    logger.warning("Redis unavailable – caching disabled. Reason: %s", exc)
    _client = None


# ── Public helpers ─────────────────────────────────────────────────────────────

def cache_get(key: str) -> Optional[Any]:
    """Return cached value (deserialised) or None on miss / error."""
    if _client is None:
        return None
    try:
        raw = _client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except RedisError as exc:
        logger.warning("cache_get(%s) failed: %s", key, exc)
        return None


def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> None:
    """Serialise *value* and store it with the given TTL (defaults to settings value)."""
    if _client is None:
        return
    try:
        _client.setex(
            key,
            ttl if ttl is not None else settings.CACHE_TTL_SECONDS,
            json.dumps(value, default=str),   # default=str handles dates / decimals
        )
    except RedisError as exc:
        logger.warning("cache_set(%s) failed: %s", key, exc)


def cache_invalidate(*keys: str) -> None:
    """Delete one or more cache keys (e.g. after a write mutation)."""
    if _client is None or not keys:
        return
    try:
        _client.delete(*keys)
    except RedisError as exc:
        logger.warning("cache_invalidate(%s) failed: %s", keys, exc)


def user_cache_key(prefix: str, user_id: int) -> str:
    """Canonical cache key builder: '<prefix>:<user_id>'."""
    return f"{prefix}:{user_id}"


def invalidate_user_caches(user_id: int, *prefixes: str) -> None:
    """Convenience wrapper – invalidate multiple per-user keys at once."""
    keys = [user_cache_key(p, user_id) for p in prefixes]
    cache_invalidate(*keys)
