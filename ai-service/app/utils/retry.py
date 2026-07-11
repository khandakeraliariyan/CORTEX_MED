import asyncio
from typing import Awaitable, Callable, TypeVar

from app.core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


async def retry_async(
    fn: Callable[[], Awaitable[T]],
    *,
    attempts: int,
    backoff_seconds: float,
) -> T:
    """Run an async callable up to `attempts` times, with a linear backoff.

    Re-raises the last exception if every attempt fails so the caller
    decides what the ultimate fallback behaviour should be.
    """
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        try:
            return await fn()
        except Exception as exc:  # noqa: BLE001 - intentionally broad, this is the retry boundary
            last_error = exc
            logger.warning("Attempt %s/%s failed: %s", attempt, attempts, exc)
            if attempt < attempts:
                await asyncio.sleep(backoff_seconds * attempt)

    assert last_error is not None
    raise last_error
