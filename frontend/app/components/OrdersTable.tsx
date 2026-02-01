"use client";

import React from 'react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
}

interface OrdersTableProps {
  orders: Order[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onEditOrder: (id: number) => void;
  onDeleteOrder: (id: number) => void;
}

/**
 * Table displaying the list of orders. Supports selection, sorting and basic actions.
 */
export default function OrdersTable({
  orders,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onSort,
  sortField,
  sortDirection,
  onEditOrder,
  onDeleteOrder,
}: OrdersTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={selectedIds.length === orders.length && orders.length > 0}
              onChange={onSelectAll}
              aria-label="Select all orders"
            />
          </th>
          <th onClick={() => onSort('order_number')} style={{ cursor: 'pointer' }}>Order Number</th>
          <th onClick={() => onSort('customer_name')} style={{ cursor: 'pointer' }}>Customer</th>
          <th onClick={() => onSort('order_date')} style={{ cursor: 'pointer' }}>Order Date</th>
          <th onClick={() => onSort('status')} style={{ cursor: 'pointer' }}>Status</th>
          <th onClick={() => onSort('total_amount')} style={{ cursor: 'pointer' }}>Total</th>
          <th onClick={() => onSort('payment_status')} style={{ cursor: 'pointer' }}>Payment</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(order.id)}
                onChange={() => onToggleSelection(order.id)}
                aria-label={`Select order ${order.order_number}`}
              />
            </td>
            <td>{order.order_number}</td>
            <td className="customer-cell">
              <span className="avatar">{order.customer_name.charAt(0)}</span>
              {order.customer_name}
            </td>
            <td>{order.order_date}</td>
            <td className="status-cell">
              <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span>
            </td>
            <td>${order.total_amount.toFixed(2)}</td>
            <td className="payment-cell">
              <span className={`payment-${order.payment_status.toLowerCase()}`}>{order.payment_status}</span>
            </td>
            <td className="actions-cell">
              <button onClick={() => onEditOrder(order.id)} title="Edit order">✏️</button>
              <button onClick={() => onDeleteOrder(order.id)} title="Delete order">🗑️</button>
              <button onClick={() => alert('More options coming soon')} title="More options">⋮</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
