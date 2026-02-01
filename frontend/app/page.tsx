"use client";

import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import FilterTabs from './components/FilterTabs';
import OrdersTable from './components/OrdersTable';
import Pagination from './components/Pagination';
import BulkActionBar from './components/BulkActionBar';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
}

type Stats = Record<string, number>;


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({});
  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Build query parameters for pagination and filtering
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (statusFilter && statusFilter !== 'All') {
        params.set('status', statusFilter);
      }
      const response = await fetch(`http://localhost:8000/orders?${params.toString()}`);
      const data = await response.json();
      let fetched: Order[] = data.items || [];
      // Filter by search query on order number, customer name or date
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.trim().toLowerCase();
        fetched = fetched.filter((o: Order) => {
          return (
            o.order_number.toLowerCase().includes(query) ||
            o.customer_name.toLowerCase().includes(query) ||
            o.order_date.toLowerCase().includes(query)
          );
        });
      }
      // Sort client-side if a sort field is selected
      if (sortField) {
        fetched = [...fetched].sort((a: any, b: any) => {
          const aVal = a[sortField];
          const bVal = b[sortField];
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }
          return sortDirection === 'asc'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        });
      }
      setOrders(fetched);
      // Use API total if present, otherwise fall back on filtered length
      setTotal(data.total || fetched.length);
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts by status for summary cards
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/orders/stats');
      const data = await response.json();
      setStats(data || {});
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  // Refresh data when relevant state changes
  useEffect(() => {
    fetchOrders();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortField, sortDirection, searchQuery]);

  // Toggle a row's selection
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Select or deselect all rows on current page
  const selectAll = () => {
    if (selectedIds.length === orders.length) {
      // Deselect all if everything is already selected
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  // Duplicate selected orders then reload
  const handleBulkDuplicate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await fetch('http://localhost:8000/orders/bulk/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: selectedIds }),
      });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to duplicate orders', error);
    }
  };

  // Delete selected orders then reload
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await fetch('http://localhost:8000/orders/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: selectedIds }),
      });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to delete orders', error);
    }
  };

  // Update status of selected orders to "Completed"
  const handleBulkUpdateStatus = async () => {
    if (selectedIds.length === 0) return;
    try {
      await fetch('http://localhost:8000/orders/bulk/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: selectedIds, status: 'Completed' }),
      });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to update order statuses', error);
    }
  };

  // Delete a single order
  const handleDeleteOrder = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/orders/${id}`, {
        method: 'DELETE',
      });
      await fetchOrders();
      await fetchStats();
    } catch (error) {
      console.error('Failed to delete order', error);
    }
  };

  // Edit a single order's status via prompt
  const handleEditOrder = async (id: number) => {
    const newStatus = prompt('Enter new status (e.g. Pending, Completed, Refunded):');
    if (!newStatus) return;
    try {
      await fetch(`http://localhost:8000/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchOrders();
      await fetchStats();
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  // Toggle sort field/direction
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Change status filter
  const handleFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  // Collapse or expand the sidebar
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Update search query and reset page
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Compute pagination text
  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(startEntry + orders.length - 1, total);
  const totalPages = Math.ceil(total / limit) || 1;

  // Filter options shown in the tab bar. These correspond to potential
  // statuses or lifecycle phases. Some may not exist in the underlying data
  // but are included to reflect the design specification.
  const filterOptions = [
    'All',
    'Incomplete',
    'Overdue',
    'Ongoing',
    'Finished',
    'Pending',
    'Completed',
    'Refunded',
  ];

  // Create a new placeholder order
  const handleAddOrder = async () => {
    try {
      const now = new Date();
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      const newOrder = {
        order_number: `#ORD${randomNum}`,
        customer_name: 'New Customer',
        order_date: now.toISOString().substring(0, 10),
        status: 'Pending',
        total_amount: 0,
        payment_status: 'Unpaid',
      };
      await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      await fetchOrders();
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  return (
    <div className={`dashboard-container${isSidebarCollapsed ? ' collapsed' : ''}`}>
      {/* Sidebar */}
      <Sidebar />
      <div className="content">
        <Header
          onToggleSidebar={handleToggleSidebar}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <StatsGrid stats={stats} />
        {/* Header actions */}
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handleBulkUpdateStatus} disabled={selectedIds.length === 0}>Bulk Update Status</button>
          <button onClick={() => alert('Export feature not implemented')}>Export Orders</button>
          <button onClick={handleAddOrder}>+ Add Orders</button>
        </div>
        <FilterTabs
          options={filterOptions}
          selected={statusFilter}
          onSelect={handleFilter}
        />
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <OrdersTable
            orders={orders}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onSelectAll={selectAll}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
        <Pagination
          start={startEntry}
          end={endEntry}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        <BulkActionBar
          count={selectedIds.length}
          onUpdateStatus={handleBulkUpdateStatus}
          onDuplicate={handleBulkDuplicate}
          onPrint={() => alert('Print feature not implemented')}
          onDelete={handleBulkDelete}
          onDismiss={() => setSelectedIds([])}
        />
      </div>
    </div>
  );
}