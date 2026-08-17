import React from 'react';

interface ShipmentStatusBadgeProps {
  status: string;
  className?: string;
}

export function ShipmentStatusBadge({ status, className = '' }: ShipmentStatusBadgeProps) {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');

  const getStyle = () => {
    switch (normalized) {
      case 'CREATED':
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'ASSIGNED':
      case 'PLANNED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PICKED_UP':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IN_TRANSIT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-navy-100 text-navy-700 border-navy-200';
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case 'CREATED':
        return 'Created';
      case 'ASSIGNED':
        return 'Driver Assigned';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
}

export function TicketStatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const normalized = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'OPEN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-navy-100 text-navy-700 border-navy-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}
    >
      {normalized.replace('_', ' ')}
    </span>
  );
}
