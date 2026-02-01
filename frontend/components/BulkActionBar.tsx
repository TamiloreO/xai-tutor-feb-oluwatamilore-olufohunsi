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
      <button className="bulk-btn" onClick={onUpdateStatus}>Update Status</button>
      <button className="bulk-btn" onClick={onDuplicate}>Duplicate</button>
      <button className="bulk-btn" onClick={onPrint}>Print</button>
      <button className="bulk-btn danger" onClick={onDelete}>Delete</button>
      <button className="bulk-btn dismiss" onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
