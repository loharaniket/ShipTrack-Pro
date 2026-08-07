import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusStyles = (statusStr) => {
    const s = statusStr?.toUpperCase() || '';
    if (['DELIVERED', 'COMPLETED'].includes(s)) return 'bg-[var(--color-status-success)] text-white';
    if (['DELAYED', 'EXCEPTION'].includes(s)) return 'bg-[var(--color-status-warning)] text-white';
    if (['FAILED', 'CANCELLED'].includes(s)) return 'bg-[var(--color-status-error)] text-white';
    if (['IN TRANSIT', 'ON ROUTE', 'ON_ROUTE'].includes(s)) return 'bg-[var(--color-status-info)] text-white';
    return 'bg-[var(--color-status-neutral)] text-white';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusStyles(status)} ${className}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
