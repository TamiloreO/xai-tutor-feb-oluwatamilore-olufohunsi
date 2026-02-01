"use client";

import React from 'react';

interface PaginationProps {
  start: number;
  end: number;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

/**
 * Render pagination controls along with a summary of entries shown.
 */
export default function Pagination({ start, end, total, page, totalPages, onPageChange }: PaginationProps) {
  return (
    <>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
        Showing {start}–{end} of {total} entries
      </div>
      <div className="pagination">
        <button onClick={() => page > 1 && onPageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={p === page ? 'active' : ''}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button onClick={() => page < totalPages && onPageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </>
  );
}
