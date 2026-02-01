from .router import router

# Export the router under two names. ``router`` is the primary name used by
# FastAPI, while ``orders_router`` mirrors the variable used in the top-level
# routes module. This prevents NameError when importing ``orders_router``.
orders_router = router

__all__ = ["router", "orders_router"]
