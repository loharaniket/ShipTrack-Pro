import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  MOCK_SHIPMENTS, MOCK_DRIVERS, MOCK_VEHICLES, MOCK_ROUTES, MOCK_ROUTE_STOPS, MOCK_EXCEPTIONS, MOCK_PODS
} from '@/services/mockData';
import { 
  Shipment, Driver, Vehicle, Route, RouteStop, ShipmentException, ProofOfDelivery, 
  ShipmentStatus, StatusHistoryEvent, RouteStatus
} from '@/types/domain';

interface DomainContextType {
  shipments: Shipment[];
  drivers: Driver[];
  vehicles: Vehicle[];
  routes: Route[];
  routeStops: RouteStop[];
  exceptions: ShipmentException[];
  pods: ProofOfDelivery[];
  
  // Actions
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus, userId: string, location: string, note?: string) => void;
  assignFleetToDriver: (driverId: string, vehicleId: string) => void;
  createRoute: (route: Route, stops: RouteStop[]) => void;
  updateRouteStatus: (routeId: string, status: RouteStatus) => void;
  optimizeRoute: (routeId: string, optimizedStopSequence: string[]) => void;
  dispatchRoute: (routeId: string) => void;
  submitPOD: (pod: ProofOfDelivery) => void;
  createException: (exception: ShipmentException) => void;
  addShipment: (shipment: Shipment) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [routeStops, setRouteStops] = useState<RouteStop[]>(MOCK_ROUTE_STOPS);
  const [exceptions, setExceptions] = useState<ShipmentException[]>(MOCK_EXCEPTIONS);
  const [pods, setPods] = useState<ProofOfDelivery[]>(MOCK_PODS);

  const updateShipmentStatus = (id: string, newStatus: ShipmentStatus, userId: string, location: string, note?: string) => {
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === id || shipment.trackingNumber === id) {
        const newEvent: StatusHistoryEvent = {
          id: Date.now().toString(),
          status: newStatus,
          timestamp: new Date().toISOString(), // Deterministic ISO time
          updatedBy: userId,
          location: location,
          note
        };
        
        // Progress logic based on status
        let progress = shipment.progressPercentage;
        if (newStatus === 'Delivered') progress = 100;
        else if (newStatus === 'Out for Delivery') progress = 90;
        else if (newStatus === 'In Transit') progress = 50;
        else if (newStatus === 'Picked Up') progress = 20;
        else if (newStatus === 'Assigned') progress = 10;
        
        return {
          ...shipment,
          status: newStatus,
          progressPercentage: progress,
          statusHistory: [newEvent, ...shipment.statusHistory]
        };
      }
      return shipment;
    }));
  };

  const assignFleetToDriver = (driverId: string, vehicleId: string) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId ? { ...driver, vehicleId } : driver
    ));
    // Optional: mark vehicle as In Use, others as Available
  };

  const createRoute = (route: Route, stops: RouteStop[]) => {
    setRoutes(prev => [...prev, route]);
    setRouteStops(prev => [...prev, ...stops]);
    // Also update shipments to be Assigned
    const shipmentIds = stops.map(s => s.shipmentId);
    setShipments(prev => prev.map(shipment => {
      if (shipmentIds.includes(shipment.id)) {
        return {
          ...shipment,
          status: 'Planned', // Or Assigned if dispatched
          routeId: route.id,
          driverId: route.driverId,
          vehicleId: route.vehicleId
        };
      }
      return shipment;
    }));
  };
  
  const updateRouteStatus = (routeId: string, status: RouteStatus) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status } : r));
  };

  const optimizeRoute = (routeId: string, optimizedStopSequence: string[]) => {
    // Reorder routeStops based on the optimized sequence
    setRouteStops(prev => {
      const updatedStops = [...prev];
      let seq = 1;
      for (const stopId of optimizedStopSequence) {
        const index = updatedStops.findIndex(s => s.id === stopId);
        if (index !== -1) {
          updatedStops[index] = { ...updatedStops[index], sequence: seq++ };
        }
      }
      return updatedStops;
    });
  };

  const dispatchRoute = (routeId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'Dispatched' } : r));
    // Update all shipments in the route to 'Assigned'
    setRouteStops(prev => {
      const routeStopItems = prev.filter(s => s.routeId === routeId);
      const shipmentIds = routeStopItems.map(s => s.shipmentId);
      
      setShipments(sPrev => sPrev.map(shipment => {
        if (shipmentIds.includes(shipment.id)) {
          const newEvent: StatusHistoryEvent = {
            id: Date.now().toString(),
            status: 'Assigned',
            timestamp: new Date().toISOString(),
            updatedBy: 'System', // System dispatch
            location: 'System'
          };
          return {
            ...shipment,
            status: 'Assigned',
            progressPercentage: 10,
            statusHistory: [newEvent, ...shipment.statusHistory]
          };
        }
        return shipment;
      }));
      return prev;
    });
  };

  const submitPOD = (pod: ProofOfDelivery) => {
    setPods(prev => [...prev, pod]);
    updateShipmentStatus(pod.shipmentId, 'Delivered', 'System', 'Delivery Location', pod.deliveryNotes);
  };

  const createException = (exception: ShipmentException) => {
    setExceptions(prev => [...prev, exception]);
    // Note: Does not automatically change shipment status unless specified
  };

  const addShipment = (shipment: Shipment) => {
    setShipments(prev => [shipment, ...prev]);
  };

  return (
    <DomainContext.Provider value={{ 
      shipments, drivers, vehicles, routes, routeStops, exceptions, pods,
      updateShipmentStatus, assignFleetToDriver, createRoute, updateRouteStatus,
      optimizeRoute, dispatchRoute, submitPOD, createException, addShipment
    }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
}
