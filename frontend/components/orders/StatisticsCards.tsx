"use client";

import { useEffect, useState } from 'react';
import { api, OrderStats } from '@/lib/api';

interface StatCard {
  label: string;
  value: number;
  color: string;
  dotColor: string;
}

export default function StatisticsCards() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getOrderStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards: StatCard[] = [
    {
      label: 'Total Orders This Month',
      value: stats?.total_this_month || 0,
      color: 'text-blue-600',
      dotColor: 'bg-blue-600',
    },
    {
      label: 'Pending Orders',
      value: stats?.pending || 0,
      color: 'text-orange-600',
      dotColor: 'bg-orange-600',
    },
    {
      label: 'Shipped Orders',
      value: stats?.shipped || 0,
      color: 'text-green-600',
      dotColor: 'bg-green-600',
    },
    {
      label: 'Refunded Orders',
      value: stats?.refunded || 0,
      color: 'text-red-600',
      dotColor: 'bg-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${card.dotColor}`}></div>
            <span className="text-sm text-gray-600">{card.label}</span>
          </div>
          <div className={`text-3xl font-bold ${card.color}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
