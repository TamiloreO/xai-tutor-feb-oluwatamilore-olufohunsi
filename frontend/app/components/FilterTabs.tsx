"use client";

import React from 'react';

interface FilterTabsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

/**
 * Render filter tabs for selecting an order status/category.
 */
export default function FilterTabs({ options, selected, onSelect }: FilterTabsProps) {
  return (
    <div className="filters">
      {options.map((status) => (
        <button
          key={status}
          className={selected === status ? 'active' : ''}
          onClick={() => onSelect(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
