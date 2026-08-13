import React, { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { ShipmentData } from './ShipmentPlanningCard';

interface SelectedShipmentListProps {
  selectedShipments: ShipmentData[];
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function SelectedShipmentList({ selectedShipments, onRemove, onReorder }: SelectedShipmentListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (selectedShipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-navy-500 bg-white border border-dashed border-navy-300 rounded-lg h-48">
        <p className="font-medium text-navy-900 mb-1">No shipments selected</p>
        <p className="text-sm text-center">Select shipments from the left panel to begin planning your route.</p>
      </div>
    );
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {selectedShipments.map((shipment, index) => (
        <div 
          key={shipment.id} 
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          className={`flex items-center space-x-3 bg-white p-3 rounded-lg border border-navy-200 shadow-sm group hover:border-primary-300 transition-colors ${draggedIndex === index ? 'opacity-50 border-primary-500 border-dashed' : ''}`}
        >
          <div className="shrink-0 text-navy-400 cursor-move hover:text-primary-600">
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex flex-col justify-center w-8 h-8 rounded-full bg-navy-100 text-navy-700 text-xs font-bold text-center shrink-0">
            {index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-navy-900 truncate">{shipment.id}</p>
              <span className="text-xs bg-navy-100 text-navy-700 px-1.5 py-0.5 rounded">{shipment.customer}</span>
            </div>
            <p className="text-xs text-navy-500 truncate mt-0.5">{shipment.pickup} → {shipment.delivery}</p>
          </div>
          
          <button 
            onClick={() => onRemove(shipment.id)}
            className="p-2 opacity-0 group-hover:opacity-100 text-navy-400 hover:text-danger-500 transition-opacity rounded hover:bg-danger-50"
            title="Remove from route"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
