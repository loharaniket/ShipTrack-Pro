import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface ShipmentData {
  id: string;
  customer: string;
  pickup: string;
  delivery: string;
  distance: string;
  priority: 'High' | 'Standard' | 'Urgent';
  deadline: string;
  status: 'Available' | 'Already Planned' | 'Assigned' | 'Completed' | 'Cancelled';
  assignedTo?: string;
  packageCount: number;
}

interface ShipmentPlanningCardProps {
  shipment: ShipmentData;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function ShipmentPlanningCard({ shipment, isSelected, onToggle }: ShipmentPlanningCardProps) {
  const isAvailable = shipment.status === 'Available';

  const getStatusMessage = () => {
    switch (shipment.status) {
      case 'Available':
        return 'Ready for route planning';
      case 'Already Planned':
        return `Assigned to Route ${shipment.assignedTo}`;
      case 'Assigned':
        return `Assigned to Driver ${shipment.assignedTo}`;
      case 'Completed':
        return 'Delivered shipments cannot be planned';
      case 'Cancelled':
        return 'Cancelled shipment cannot be planned';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (shipment.status) {
      case 'Available':
        return 'bg-success-50 border-success-200 text-success-700';
      case 'Already Planned':
      case 'Assigned':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'Completed':
        return 'bg-navy-50 border-navy-200 text-navy-500';
      case 'Cancelled':
        return 'bg-danger-50 border-danger-200 text-danger-700';
      default:
        return '';
    }
  };

  const getPriorityVariant = () => {
    switch (shipment.priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Card className={`mb-3 transition-colors ${isSelected ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50/10' : ''} ${!isAvailable ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-navy-900">{shipment.id}</span>
            <Badge variant={getPriorityVariant()}>{shipment.priority}</Badge>
          </div>
          <div className="flex items-center">
            {isAvailable ? (
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-sm font-medium text-navy-700">Select</span>
                <input 
                  type="checkbox" 
                  className="rounded border-navy-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                  checked={isSelected}
                  onChange={() => onToggle(shipment.id)}
                />
              </label>
            ) : (
              <span className="text-xs font-medium text-navy-400">Unavailable</span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div>
            <p className="text-sm font-medium text-navy-900">{shipment.customer}</p>
            <p className="text-xs text-navy-500">{shipment.packageCount} Package(s) • {shipment.distance}</p>
          </div>
          
          <div className="flex items-center text-sm text-navy-700 bg-navy-50 p-2 rounded-md">
            <div className="flex flex-col flex-1 relative">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-navy-400 shrink-0" />
                <span className="truncate">{shipment.pickup}</span>
              </div>
              <div className="w-0.5 h-3 bg-navy-200 ml-1 my-0.5" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                <span className="truncate">{shipment.delivery}</span>
              </div>
            </div>
          </div>

          <div>
             <p className="text-xs text-navy-500">Deadline: <span className="font-medium text-navy-700">{shipment.deadline}</span></p>
          </div>
        </div>

        <div className={`text-xs px-2 py-1.5 rounded border flex items-center ${getStatusColor()}`}>
           <span className="font-medium">{getStatusMessage()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
