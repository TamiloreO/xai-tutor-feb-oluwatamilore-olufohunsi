"""REST endpoints for orders."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from . import crud
from .models import (
    BulkIds,
    BulkStatusUpdate,
    OrderCreate,
    OrderResponse,
    OrderUpdate,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=None)
def list_orders(
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """List orders with optional status filter and pagination."""
    return crud.list_orders(status, page, limit)


@router.get("/stats", response_model=None)
def get_order_stats():
    """Return counts of orders grouped by status."""
    return crud.get_order_stats()


@router.get("/{order_id}", response_model=None)
def get_order(order_id: int):
    """Retrieve a single order by its ID."""
    return crud.get_order(order_id)


@router.post("", status_code=201, response_model=None)
def create_order(order: OrderCreate):
    """Create a new order."""
    return crud.create_order(order)


@router.put("/{order_id}", response_model=None)
def update_order(order_id: int, order: OrderUpdate):
    """Update an existing order."""
    return crud.update_order(order_id, order)


@router.delete("/{order_id}", status_code=204, response_model=None)
def delete_order(order_id: int):
    """Delete a single order."""
    crud.delete_order(order_id)
    return None


@router.put("/bulk/status", response_model=None)
def bulk_update_status(payload: BulkStatusUpdate):
    """Bulk update the status of multiple orders."""
    updated = crud.bulk_update_status(payload.order_ids, payload.status)
    return {"updated": updated}


@router.post("/bulk/duplicate", response_model=None)
def bulk_duplicate(payload: BulkIds):
    """Duplicate multiple orders."""
    orders = crud.bulk_duplicate(payload.order_ids)
    return {"orders": orders}


@router.delete("/bulk", status_code=204, response_model=None)
def bulk_delete(payload: BulkIds):
    """Delete multiple orders at once."""
    crud.bulk_delete(payload.order_ids)
    return None
