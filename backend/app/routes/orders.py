from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Literal
from datetime import datetime
import math

from app.database import get_db
from app.models import (
    OrderCreate, OrderUpdate, OrderResponse, OrderListResponse,
    BulkStatusUpdate, BulkDelete, BulkDuplicate
)

router = APIRouter(prefix="/orders", tags=["orders"])


def generate_order_number(conn) -> str:
    """Generate a unique order number"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM orders")
    count = cursor.fetchone()["count"]
    return f"#ORD{1000 + count + 1}"


def row_to_order(row) -> dict:
    """Convert database row to order dict"""
    return {
        "id": row["id"],
        "order_number": row["order_number"],
        "customer_name": row["customer_name"],
        "customer_avatar": row["customer_avatar"],
        "order_date": row["order_date"],
        "status": row["status"],
        "total_amount": row["total_amount"],
        "payment_status": row["payment_status"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


@router.get("", response_model=OrderListResponse)
def list_orders(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[Literal['Pending', 'Completed', 'Refunded']] = None,
    payment_status: Optional[Literal['Paid', 'Unpaid']] = None,
    search: Optional[str] = None,
    sort_by: str = Query("order_date", description="Field to sort by"),
    sort_order: Literal['asc', 'desc'] = Query("desc", description="Sort order")
):
    """
    List all orders with filtering, sorting, and pagination.
    
    - **page**: Page number (starts at 1)
    - **per_page**: Number of items per page (max 100)
    - **status**: Filter by order status
    - **payment_status**: Filter by payment status
    - **search**: Search in order number or customer name
    - **sort_by**: Field to sort by (order_date, total_amount, status, etc.)
    - **sort_order**: Sort order (asc or desc)
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Build WHERE clause
            where_clauses = []
            params = []
            
            if status:
                where_clauses.append("status = ?")
                params.append(status)
            
            if payment_status:
                where_clauses.append("payment_status = ?")
                params.append(payment_status)
            
            if search:
                where_clauses.append("(order_number LIKE ? OR customer_name LIKE ?)")
                search_term = f"%{search}%"
                params.extend([search_term, search_term])
            
            where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
            
            # Get total count
            count_query = f"SELECT COUNT(*) as total FROM orders {where_sql}"
            cursor.execute(count_query, params)
            total = cursor.fetchone()["total"]
            
            # Calculate pagination
            total_pages = math.ceil(total / per_page)
            offset = (page - 1) * per_page
            
            # Validate sort_by to prevent SQL injection
            allowed_sort_fields = ["id", "order_number", "customer_name", "order_date", 
                                   "status", "total_amount", "payment_status", "created_at"]
            if sort_by not in allowed_sort_fields:
                sort_by = "order_date"
            
            # Get paginated results
            query = f"""
                SELECT * FROM orders 
                {where_sql}
                ORDER BY {sort_by} {sort_order.upper()}
                LIMIT ? OFFSET ?
            """
            cursor.execute(query, params + [per_page, offset])
            rows = cursor.fetchall()
            
            orders = [row_to_order(row) for row in rows]
            
            return {
                "orders": orders,
                "total": total,
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int):
    """
    Get a single order by ID.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
            row = cursor.fetchone()
            
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found")
            
            return row_to_order(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("", status_code=201, response_model=OrderResponse)
def create_order(order: OrderCreate):
    """
    Create a new order.
    Order number is automatically generated.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Generate order number
            order_number = generate_order_number(conn)
            
            # Insert order
            cursor.execute("""
                INSERT INTO orders (
                    order_number, customer_name, customer_avatar, order_date,
                    status, total_amount, payment_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                order_number,
                order.customer_name,
                order.customer_avatar,
                order.order_date.isoformat(),
                order.status,
                order.total_amount,
                order.payment_status
            ))
            
            order_id = cursor.lastrowid
            
            # Fetch the created order
            cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
            row = cursor.fetchone()
            
            return row_to_order(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order: OrderUpdate):
    """
    Update an existing order.
    Only provided fields will be updated.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if order exists
            cursor.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Order not found")
            
            # Build update query dynamically
            update_fields = []
            params = []
            
            if order.customer_name is not None:
                update_fields.append("customer_name = ?")
                params.append(order.customer_name)
            
            if order.customer_avatar is not None:
                update_fields.append("customer_avatar = ?")
                params.append(order.customer_avatar)
            
            if order.order_date is not None:
                update_fields.append("order_date = ?")
                params.append(order.order_date.isoformat())
            
            if order.status is not None:
                update_fields.append("status = ?")
                params.append(order.status)
            
            if order.total_amount is not None:
                update_fields.append("total_amount = ?")
                params.append(order.total_amount)
            
            if order.payment_status is not None:
                update_fields.append("payment_status = ?")
                params.append(order.payment_status)
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            # Always update the updated_at timestamp
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(order_id)
            
            # Execute update
            query = f"UPDATE orders SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            
            # Fetch updated order
            cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
            row = cursor.fetchone()
            
            return row_to_order(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int):
    """
    Delete an order by ID.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if order exists
            cursor.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Order not found")
            
            # Delete the order
            cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
            
            return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/bulk/status")
def bulk_update_status(bulk_update: BulkStatusUpdate):
    """
    Bulk update the status of multiple orders.
    
    - **order_ids**: List of order IDs to update
    - **status**: New status to apply to all orders
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Build placeholders for IN clause
            placeholders = ','.join('?' * len(bulk_update.order_ids))
            
            # Update all orders
            query = f"""
                UPDATE orders 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id IN ({placeholders})
            """
            cursor.execute(query, [bulk_update.status] + bulk_update.order_ids)
            
            updated_count = cursor.rowcount
            
            return {
                "message": f"Successfully updated {updated_count} orders",
                "updated_count": updated_count,
                "order_ids": bulk_update.order_ids,
                "new_status": bulk_update.status
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/bulk/duplicate")
def bulk_duplicate_orders(bulk_duplicate: BulkDuplicate):
    """
    Duplicate multiple orders.
    Creates new orders with the same data but new order numbers.
    
    - **order_ids**: List of order IDs to duplicate
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Fetch orders to duplicate
            placeholders = ','.join('?' * len(bulk_duplicate.order_ids))
            query = f"SELECT * FROM orders WHERE id IN ({placeholders})"
            cursor.execute(query, bulk_duplicate.order_ids)
            orders = cursor.fetchall()
            
            if not orders:
                raise HTTPException(status_code=404, detail="No orders found to duplicate")
            
            duplicated_ids = []
            
            # Duplicate each order
            for order in orders:
                order_number = generate_order_number(conn)
                
                cursor.execute("""
                    INSERT INTO orders (
                        order_number, customer_name, customer_avatar, order_date,
                        status, total_amount, payment_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    order_number,
                    order["customer_name"],
                    order["customer_avatar"],
                    order["order_date"],
                    order["status"],
                    order["total_amount"],
                    order["payment_status"]
                ))
                
                duplicated_ids.append(cursor.lastrowid)
            
            return {
                "message": f"Successfully duplicated {len(duplicated_ids)} orders",
                "duplicated_count": len(duplicated_ids),
                "original_ids": bulk_duplicate.order_ids,
                "new_ids": duplicated_ids
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/bulk")
def bulk_delete_orders(bulk_delete: BulkDelete):
    """
    Bulk delete multiple orders.
    
    - **order_ids**: List of order IDs to delete
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Build placeholders for IN clause
            placeholders = ','.join('?' * len(bulk_delete.order_ids))
            
            # Delete all orders
            query = f"DELETE FROM orders WHERE id IN ({placeholders})"
            cursor.execute(query, bulk_delete.order_ids)
            
            deleted_count = cursor.rowcount
            
            return {
                "message": f"Successfully deleted {deleted_count} orders",
                "deleted_count": deleted_count,
                "order_ids": bulk_delete.order_ids
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/stats/summary")
def get_order_statistics():
    """
    Get summary statistics for orders.
    Returns counts for total, pending, shipped (completed), and refunded orders.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get total orders this month
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM orders 
                WHERE strftime('%Y-%m', order_date) = strftime('%Y-%m', 'now')
            """)
            total_this_month = cursor.fetchone()["count"]
            
            # Get pending orders
            cursor.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'")
            pending = cursor.fetchone()["count"]
            
            # Get shipped (completed) orders
            cursor.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Completed'")
            shipped = cursor.fetchone()["count"]
            
            # Get refunded orders
            cursor.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Refunded'")
            refunded = cursor.fetchone()["count"]
            
            return {
                "total_this_month": total_this_month,
                "pending": pending,
                "shipped": shipped,
                "refunded": refunded
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
