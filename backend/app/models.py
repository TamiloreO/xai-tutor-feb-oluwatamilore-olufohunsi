from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date


class OrderBase(BaseModel):
    """Base order model with common fields"""
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_avatar: Optional[str] = None
    order_date: date
    status: Literal['Pending', 'Completed', 'Refunded']
    total_amount: float = Field(..., gt=0)
    payment_status: Literal['Paid', 'Unpaid']


class OrderCreate(OrderBase):
    """Model for creating a new order"""
    pass


class OrderUpdate(BaseModel):
    """Model for updating an order (all fields optional)"""
    customer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    customer_avatar: Optional[str] = None
    order_date: Optional[date] = None
    status: Optional[Literal['Pending', 'Completed', 'Refunded']] = None
    total_amount: Optional[float] = Field(None, gt=0)
    payment_status: Optional[Literal['Paid', 'Unpaid']] = None


class OrderResponse(OrderBase):
    """Model for order responses"""
    id: int
    order_number: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class BulkStatusUpdate(BaseModel):
    """Model for bulk status updates"""
    order_ids: list[int] = Field(..., min_length=1)
    status: Literal['Pending', 'Completed', 'Refunded']


class BulkDelete(BaseModel):
    """Model for bulk delete operations"""
    order_ids: list[int] = Field(..., min_length=1)


class BulkDuplicate(BaseModel):
    """Model for bulk duplicate operations"""
    order_ids: list[int] = Field(..., min_length=1)


class OrderListResponse(BaseModel):
    """Model for paginated order list responses"""
    orders: list[OrderResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
