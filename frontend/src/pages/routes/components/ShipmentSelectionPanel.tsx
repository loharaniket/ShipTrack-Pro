import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { ShipmentPlanningCard } from './ShipmentPlanningCard';
import { Shipment } from '@/types/domain';
import { useDomain } from '@/context/DomainContext';

interface ShipmentSelectionPanelProps {
  shipments: Shipment[];
  selectedIds: string[];
  onToggleShipment: (id: string) => void;
}

export function ShipmentSelectionPanel({ shipments, selectedIds, onToggleShipment }: ShipmentSelectionPanelProps) {
  const { isShipmentEligibleForPlanning, getShipmentView } = useDomain();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      if (!isShipmentEligibleForPlanning(s)) return false;
      
      const dest = getShipmentView(s.id)?.destinationAddressLabel || '';
      const matchesSearch = 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [shipments, searchTerm, isShipmentEligibleForPlanning, getShipmentView]);

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
