"use client";

import { useState } from 'react';
import { Copy, Printer, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface BulkActionBarProps {
  selectedIds: number[];
  onClear: () => void;
  onActionComplete: () => void;
}

export default function BulkActionBar({
  selectedIds,
  onClear,
  onActionComplete,
}: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleDuplicate = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await api.bulkDuplicate(selectedIds);
      alert(`Successfully duplicated ${result.duplicated_count} orders`);
      onActionComplete();
      onClear();
    } catch (error) {
      console.error('Failed to duplicate orders:', error);
      alert('Failed to duplicate orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    alert('Print functionality would be implemented here');
  };

  const handleDelete = async () => {
    if (loading) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} orders?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.bulkDelete(selectedIds);
      alert(`Successfully deleted ${result.deleted_count} orders`);
      onActionComplete();
      onClear();
    } catch (error) {
      console.error('Failed to delete orders:', error);
      alert('Failed to delete orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
        {/* Selected count */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-300">
          <span className="text-sm font-medium text-gray-900">
            {selectedIds.length} Selected
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>

          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClear}
          disabled={loading}
          className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
