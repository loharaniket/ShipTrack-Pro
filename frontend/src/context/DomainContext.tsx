import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  MOCK_SHIPMENTS, MOCK_DRIVERS, MOCK_VEHICLES, MOCK_ROUTES, MOCK_ROUTE_STOPS, MOCK_EXCEPTIONS, MOCK_PODS
} from '@/services/mockData';
import { 
  Shipment, Driver, Route, RouteStop, ShipmentException, ProofOfDelivery, 
  ShipmentStatus, ShipmentHistoryEvent, RouteStatus, OptimizationResult
} from '@/types/domain';
import { canTransitionShipmentStatus, canTransitionRouteStatus } from '@/utils/statusTransitions';

interface DomainContextType {
  shipments: Shipment[];
  drivers: Driver[];
  routes: Route[];
  routeStops: RouteStop[];
  exceptions: ShipmentException[];
  pods: ProofOfDelivery[];
  
  // Actions
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus, userId: string, location: string, note?: string) => void;
  createRoute: (route: Route, stops: RouteStop[]) => void;
  updateRouteStatus: (routeId: string, status: RouteStatus) => void;
  updateRouteStopStatus: (routeStopId: string, status: RouteStopStatus) => void;
  assignDriverToRoute: (routeId: string, driverId: string) => void;
  optimizeRoute: (routeId: string, result: OptimizationResult) => void;
  dispatchRoute: (routeId: string) => void;
  submitPOD: (pod: ProofOfDelivery) => void;
  createException: (exception: ShipmentException) => void;
  addShipment: (shipment: Shipment) => void;
  addDriver: (driver: Driver) => void;
  isShipmentEligibleForPlanning: (shipment: Shipment) => boolean;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [routeStops, setRouteStops] = useState<RouteStop[]>(MOCK_ROUTE_STOPS);
  const [exceptions, setExceptions] = useState<ShipmentException[]>(MOCK_EXCEPTIONS);
  const [pods, setPods] = useState<ProofOfDelivery[]>(MOCK_PODS);

  const updateShipmentStatus = (id: string, newStatus: ShipmentStatus, userId: string, location: string, note?: string) => {
    setShipments(prev => prev.map(shipment => {
      if ((shipment.id === id || shipment.trackingNumber === id) && canTransitionShipmentStatus(shipment.status, newStatus)) {
        const newEvent: ShipmentHistoryEvent = {
          id: Date.now().toString(),
          shipmentId: shipment.id,
          previousStatus: shipment.status,
          newStatus: newStatus,
          timestamp: new Date().toISOString(),
          actorUserId: userId,
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

  const createRoute = (route: Route, stops: RouteStop[]) => {
    setRoutes(prev => [...prev, route]);
    setRouteStops(prev => [...prev, ...stops]);
    // Also update shipments to be Planned
    const shipmentIds = stops.map(s => s.shipmentId);
    setShipments(prev => prev.map(shipment => {
      if (shipmentIds.includes(shipment.id)) {
        const newEvent: ShipmentHistoryEvent = {
          id: Date.now().toString(),
          shipmentId: shipment.id,
          previousStatus: shipment.status,
          newStatus: 'Planned',
          timestamp: new Date().toISOString(),
          actorUserId: 'System',
        };
        return {
          ...shipment,
          status: 'Planned',
          routeId: route.id,
          statusHistory: [newEvent, ...shipment.statusHistory]
        };
      }
      return shipment;
    }));
  };
  
  const updateRouteStatus = (routeId: string, status: RouteStatus) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status } : r));
  };

  const updateRouteStopStatus = (routeStopId: string, status: RouteStopStatus) => {
    setRouteStops(prev => prev.map(s => s.id === routeStopId ? { ...s, status } : s));
  };

  const assignDriverToRoute = (routeId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver || !driver.vehicle) return;
    
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'Assigned', driverId: driver.id } : r));
    
    setRouteStops(prev => {
      const routeStopItems = prev.filter(s => s.routeId === routeId);
      const shipmentIds = routeStopItems.map(s => s.shipmentId);
      
      setShipments(sPrev => sPrev.map(shipment => {
        if (shipmentIds.includes(shipment.id)) {
          const newEvent: ShipmentHistoryEvent = {
            id: Date.now().toString(),
            shipmentId: shipment.id,
            previousStatus: shipment.status,
            newStatus: 'Assigned',
            timestamp: new Date().toISOString(),
            actorUserId: 'System',
          };
          return {
            ...shipment,
            status: 'Assigned',
            driverId: driver.id,
            progressPercentage: 10,
            statusHistory: [newEvent, ...shipment.statusHistory]
          };
        }
        return shipment;
      }));
      return prev;
    });
  };

  const optimizeRoute = (routeId: string, result: OptimizationResult) => {
    setRouteStops(prev => {
      const updatedStops = [...prev];
      let seq = 1;
      for (const stopId of result.optimizedStopSequence) {
        const index = updatedStops.findIndex(s => s.id === stopId);
        if (index !== -1) {
          updatedStops[index] = { ...updatedStops[index], sequence: seq++ };
        }
      }
      return updatedStops;
    });
  };

  const dispatchRoute = (routeId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId && r.status === 'Assigned' ? { ...r, status: 'Dispatched' } : r));
    // Note: Shipments remain 'Assigned' until the Driver physically acts on them
  };

  const submitPOD = (pod: ProofOfDelivery) => {
    setPods(prev => [...prev, pod]);
    updateShipmentStatus(pod.shipmentId, 'Delivered', 'System', 'Delivery Location', pod.deliveryNotes);
    
    setRouteStops(prev => prev.map(s => 
      s.shipmentId === pod.shipmentId ? { ...s, status: 'Completed' } : s
    ));
  };

  const createException = (exception: ShipmentException) => {
    setExceptions(prev => [...prev, exception]);
    // Note: Does not automatically change shipment status unless specified
  };

  const addShipment = (shipment: Shipment) => {
    setShipments(prev => [shipment, ...prev]);
  };

  const addDriver = (driver: Driver) => {
    setDrivers(prev => [driver, ...prev]);
  };

  const isShipmentEligibleForPlanning = (shipment: Shipment) => {
    return shipment.status === 'Ready for Planning';
  };

  return (
    <DomainContext.Provider value={{ 
      shipments, drivers, routes, routeStops, exceptions, pods,
      updateShipmentStatus, createRoute, updateRouteStatus, updateRouteStopStatus,
      assignDriverToRoute, optimizeRoute, dispatchRoute, submitPOD, createException, addShipment, addDriver,
      isShipmentEligibleForPlanning
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
