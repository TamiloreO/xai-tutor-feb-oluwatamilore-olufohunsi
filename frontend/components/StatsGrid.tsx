"use client";

import React from 'react';

export type Stats = Record<string, number>;

interface StatsGridProps {
  stats: Stats;
}

/**
 * Display four summary cards for total, pending, completed and refunded orders.
 */
export default function StatsGrid({ stats }: StatsGridProps) {
  const totalOrders = (stats.Pending || 0) + (stats.Completed || 0) + (stats.Refunded || 0);
  return (
    <div className="stats-grid">
      <div className="stats-card">
        <div className="content">
          <div className="title">Total Orders This Month</div>
          <div className="value">{totalOrders}</div>
        </div>
        <div className="indicator" style={{ backgroundColor: '#2563eb' }}></div>
      </div>
      <div className="stats-card">
        <div className="content">
          <div className="title">Pending Orders</div>
          <div className="value">{stats.Pending || 0}</div>
        </div>
        <div className="indicator" style={{ backgroundColor: '#facc15' }}></div>
      </div>
      <div className="stats-card">
        <div className="content">
          <div className="title">Shipped Orders</div>
          <div className="value">{stats.Completed || 0}</div>
        </div>
        <div className="indicator" style={{ backgroundColor: '#16a34a' }}></div>
      </div>
      <div className="stats-card">
        <div className="content">
          <div className="title">Refunded Orders</div>
          <div className="value">{stats.Refunded || 0}</div>
        </div>
        <div className="indicator" style={{ backgroundColor: '#ef4444' }}></div>
      </div>
    </div>
  );
}
