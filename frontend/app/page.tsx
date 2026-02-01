"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import StatisticsCards from '@/components/orders/StatisticsCards';
import OrdersTable from '@/components/orders/OrdersTable';
import BulkActionBar from '@/components/orders/BulkActionBar';

export default function Home() {
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActionComplete = () => {
    // Trigger a refresh of the orders table
    setRefreshKey(prev => prev + 1);
  };

  const handleClearSelection = () => {
    setSelectedOrderIds([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Statistics Cards */}
          <StatisticsCards key={`stats-${refreshKey}`} />

          {/* Orders Table */}
          <OrdersTable
            key={`table-${refreshKey}`}
            onSelectionChange={setSelectedOrderIds}
          />
        </main>

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedIds={selectedOrderIds}
          onClear={handleClearSelection}
          onActionComplete={handleActionComplete}
        />
      </div>
    </div>
  );
}
