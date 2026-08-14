import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { ShipmentPlanningCard } from './ShipmentPlanningCard';
import { Shipment } from '@/types/domain';

interface ShipmentSelectionPanelProps {
  shipments: Shipment[];
  selectedIds: string[];
  onToggleShipment: (id: string) => void;
}

export function ShipmentSelectionPanel({ shipments, selectedIds, onToggleShipment }: ShipmentSelectionPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, filterStatus]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-navy-200 shadow-sm z-10 w-96 shrink-0">
      <div className="p-4 border-b border-navy-200">
        <h2 className="text-xl font-semibold text-navy-900">Step 1: Select Shipments</h2>
        <p className="text-sm text-navy-500 mb-4">Choose available shipments for this route</p>
        
        <div className="space-y-3">
          <Input 
            placeholder="Search ID, customer, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Ready for Planning">Ready for Planning</option>
            <option value="Planned">Planned</option>
            <option value="In Transit">In Transit</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-navy-50">
        {filteredShipments.length === 0 ? (
          <div className="text-center py-8 text-navy-500">
            <p className="text-sm font-medium text-navy-900">No shipments match your filters.</p>
            <p className="text-xs mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          filteredShipments.map(shipment => (
            <ShipmentPlanningCard 
              key={shipment.id}
              shipment={shipment}
              isSelected={selectedIds.includes(shipment.id)}
              onToggle={onToggleShipment}
            />
          ))
        )}
      </div>
    </div>
  );
}
