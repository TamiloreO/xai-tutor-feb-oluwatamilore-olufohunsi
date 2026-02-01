"use client";

import React from 'react';

interface BulkActionBarProps {
  count: number;
  onUpdateStatus: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onDelete: () => void;
  onDismiss: () => void;
}

/**
 * Floating bar for bulk operations on selected orders.
 */
export default function BulkActionBar({ count, onUpdateStatus, onDuplicate, onPrint, onDelete, onDismiss }: BulkActionBarProps) {
  if (count === 0) return null;
  return (
    <div className="bulk-bar">
      <span className="bulk-count">{count} selected</span>
      <button onClick={onUpdateStatus}>Update Status</button>
      <button onClick={onDuplicate}>Duplicate</button>
      <button onClick={onPrint}>Print</button>
      <button onClick={onDelete} style={{ backgroundColor: '#dc2626' }}>
        Delete
      </button>
      <button onClick={onDismiss} style={{ marginLeft: 'auto' }}>
        Dismiss
      </button>
    </div>
  );
}
