import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_SHIPMENTS, ShipmentData, TimelineEvent, MOCK_DRIVERS, MOCK_VEHICLES } from '@/services/mockData';

interface ShipmentContextType {
  shipments: ShipmentData[];
  drivers: typeof MOCK_DRIVERS;
  vehicles: typeof MOCK_VEHICLES;
  updateShipmentStatus: (id: string, newStatus: ShipmentData['status'], note?: string) => void;
  addTimelineEvent: (id: string, title: string, location: string) => void;
  assignFleet: (shipmentIds: string[], driverId: string, vehicleId: string) => void;
  addShipment: (shipment: ShipmentData) => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export function ShipmentProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<ShipmentData[]>(MOCK_SHIPMENTS);
  const drivers = MOCK_DRIVERS;
  const vehicles = MOCK_VEHICLES;

  const updateShipmentStatus = (id: string, newStatus: ShipmentData['status'], note?: string) => {
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === id || shipment.tracking === id) {
        const newEvent: TimelineEvent = {
          id: Date.now().toString(),
          status: newStatus,
          timestamp: 'Just now',
          location: 'System',
          note
        };
        return {
          ...shipment,
          status: newStatus,
          lastUpdated: 'Just now',
          statusHistory: [newEvent, ...shipment.statusHistory]
        };
      }
      return shipment;
    }));
  };

  const addTimelineEvent = (id: string, title: string, location: string) => {
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === id || shipment.tracking === id) {
        const newEvent: TimelineEvent = {
          id: Date.now().toString(),
          status: title, // Using status field for title
          timestamp: 'Just now',
          location: location
        };
        return {
          ...shipment,
          statusHistory: [newEvent, ...shipment.statusHistory]
        };
      }
      return shipment;
    }));
  };

  const assignFleet = (shipmentIds: string[], driverId: string, vehicleId: string) => {
    setShipments(prev => prev.map(shipment => {
      if (shipmentIds.includes(shipment.id)) {
         const newEvent: TimelineEvent = {
           id: Date.now().toString() + shipment.id,
           status: 'Assigned',
           timestamp: 'Just now',
           location: 'System'
         };
         return {
           ...shipment,
           status: 'Assigned',
           driverId,
           vehicleId,
           lastUpdated: 'Just now',
           statusHistory: [newEvent, ...shipment.statusHistory]
         };
      }
      return shipment;
    }));
  };

  const addShipment = (shipment: ShipmentData) => {
    setShipments(prev => [shipment, ...prev]);
  };

  return (
    <ShipmentContext.Provider value={{ shipments, drivers, vehicles, updateShipmentStatus, addTimelineEvent, assignFleet, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  const context = useContext(ShipmentContext);
  if (context === undefined) {
    throw new Error('useShipments must be used within a ShipmentProvider');
  }
  return context;
}
