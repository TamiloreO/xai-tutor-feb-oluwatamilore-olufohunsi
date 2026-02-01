"""Helpers for reading and writing orders."""

from typing import List, Optional

from fastapi import HTTPException

from app.database import get_db


def list_orders(status: Optional[str], page: int, limit: int):
    """Fetch a paginated list of orders optionally filtered by status."""
    offset = (page - 1) * limit
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            base_query = (
                "SELECT id, order_number, customer_name, order_date, status, total_amount, payment_status "
                "FROM orders"
            )
            params: List[object] = []
            if status:
                base_query += " WHERE status = ?"
                params.append(status)
            # total count
            count_query = f"SELECT COUNT(*) as count FROM (" + base_query + ")"
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()["count"]
            # ordering, limit, offset
            base_query += " ORDER BY id LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            cursor.execute(base_query, params)
            rows = cursor.fetchall()
            orders = [
                {
                    "id": row["id"],
                    "order_number": row["order_number"],
                    "customer_name": row["customer_name"],
                    "order_date": row["order_date"],
                    "status": row["status"],
                    "total_amount": row["total_amount"],
                    "payment_status": row["payment_status"],
                }
                for row in rows
            ]
            return {
                "items": orders,
                "page": page,
                "limit": limit,
                "total": total_count,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_order_stats():
    """Return counts of orders grouped by status."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
            )
            return {row["status"]: row["count"] for row in cursor.fetchall()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_order(order_id: int):
    """Retrieve a single order by its ID."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, order_number, customer_name, order_date, status, total_amount, payment_status "
                "FROM orders WHERE id = ?",
                (order_id,),
            )
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found")
            return {
                "id": row["id"],
                "order_number": row["order_number"],
                "customer_name": row["customer_name"],
                "order_date": row["order_date"],
                "status": row["status"],
                "total_amount": row["total_amount"],
                "payment_status": row["payment_status"],
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def create_order(order):
    """Insert a new order and return it with its generated ID."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO orders (order_number, customer_name, order_date, status, total_amount, payment_status) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    order.order_number,
                    order.customer_name,
                    order.order_date,
                    order.status,
                    order.total_amount,
                    order.payment_status,
                ),
            )
            order_id = cursor.lastrowid
            return {
                "id": order_id,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "order_date": order.order_date,
                "status": order.status,
                "total_amount": order.total_amount,
                "payment_status": order.payment_status,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_order(order_id: int, order):
    """Update an order given its ID and return the updated record."""
    fields = []
    params: List[object] = []
    if order.order_number is not None:
        fields.append("order_number = ?")
        params.append(order.order_number)
    if order.customer_name is not None:
        fields.append("customer_name = ?")
        params.append(order.customer_name)
    if order.order_date is not None:
        fields.append("order_date = ?")
        params.append(order.order_date)
    if order.status is not None:
        fields.append("status = ?")
        params.append(order.status)
    if order.total_amount is not None:
        fields.append("total_amount = ?")
        params.append(order.total_amount)
    if order.payment_status is not None:
        fields.append("payment_status = ?")
        params.append(order.payment_status)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            # confirm existence
            cursor.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Order not found")
            query = f"UPDATE orders SET {', '.join(fields)} WHERE id = ?"
            params.append(order_id)
            cursor.execute(query, params)
            cursor.execute(
                "SELECT id, order_number, customer_name, order_date, status, total_amount, payment_status "
                "FROM orders WHERE id = ?",
                (order_id,),
            )
            row = cursor.fetchone()
            return {
                "id": row["id"],
                "order_number": row["order_number"],
                "customer_name": row["customer_name"],
                "order_date": row["order_date"],
                "status": row["status"],
                "total_amount": row["total_amount"],
                "payment_status": row["payment_status"],
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def delete_order(order_id: int):
    """Remove a single order."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Order not found")
            cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
            return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def bulk_update_status(order_ids: List[int], status: str):
    """Set the same status on multiple orders."""
    if not order_ids:
        raise HTTPException(status_code=400, detail="order_ids must not be empty")
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ",".join(["?"] * len(order_ids))
            query = f"UPDATE orders SET status = ? WHERE id IN ({placeholders})"
            params: List[object] = [status, *order_ids]
            cursor.execute(query, params)
            return cursor.rowcount
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def bulk_duplicate(order_ids: List[int]):
    """Duplicate the specified orders and return the new records."""
    if not order_ids:
        raise HTTPException(status_code=400, detail="order_ids must not be empty")
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ",".join(["?"] * len(order_ids))
            cursor.execute(
                f"SELECT id, order_number, customer_name, order_date, status, total_amount, payment_status "
                f"FROM orders WHERE id IN ({placeholders})",
                order_ids,
            )
            originals = cursor.fetchall()
            if not originals:
                raise HTTPException(status_code=404, detail="No orders found to duplicate")
            new_orders = []
            suffix_counter = 1
            for row in originals:
                base_number = row["order_number"]
                new_number = f"{base_number}-COPY"
                while True:
                    cursor.execute(
                        "SELECT 1 FROM orders WHERE order_number = ?",
                        (new_number,),
                    )
                    if cursor.fetchone() is None:
                        break
                    suffix_counter += 1
                    new_number = f"{base_number}-COPY{suffix_counter}"
                cursor.execute(
                    "INSERT INTO orders (order_number, customer_name, order_date, status, total_amount, payment_status) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        new_number,
                        row["customer_name"],
                        row["order_date"],
                        row["status"],
                        row["total_amount"],
                        row["payment_status"],
                    ),
                )
                new_id = cursor.lastrowid
                new_orders.append(
                    {
                        "id": new_id,
                        "order_number": new_number,
                        "customer_name": row["customer_name"],
                        "order_date": row["order_date"],
                        "status": row["status"],
                        "total_amount": row["total_amount"],
                        "payment_status": row["payment_status"],
                    }
                )
            return new_orders
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def bulk_delete(order_ids: List[int]):
    """Delete multiple orders by their IDs."""
    if not order_ids:
        raise HTTPException(status_code=400, detail="order_ids must not be empty")
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ",".join(["?"] * len(order_ids))
            cursor.execute(f"DELETE FROM orders WHERE id IN ({placeholders})", order_ids)
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
