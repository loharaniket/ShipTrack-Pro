import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  MOCK_SHIPMENTS, MOCK_DRIVERS, MOCK_VEHICLES, MOCK_ROUTES, MOCK_ROUTE_STOPS, MOCK_EXCEPTIONS, MOCK_PODS,
  MOCK_ADDRESSES, MOCK_PACKAGES, MOCK_ORGANIZATIONS, MOCK_STATUS_EVENTS, MOCK_TRACKING_EVENTS, MOCK_DRIVER_VEHICLE_ASSIGNMENTS
} from '@/services/mockData';
import { 
  Shipment, Driver, Route, RouteStop, ShipmentException, ProofOfDelivery, 
  ShipmentStatus, ShipmentStatusEvent, RouteStatus, RouteStopStatus, OptimizationResult,
  Address, ShipmentPackage, Vehicle, Organization, TrackingEvent, ShipmentView, DriverVehicleAssignment
} from '@/types/domain';
import { canTransitionShipmentStatus } from '@/utils/statusTransitions';

interface DomainContextType {
  // Normalized Data Stores
  organizations: Organization[];
  addresses: Address[];
  shipments: Shipment[];
  packages: ShipmentPackage[];
  drivers: Driver[];
  vehicles: Vehicle[];
  driverVehicleAssignments: DriverVehicleAssignment[];
  routes: Route[];
  routeStops: RouteStop[];
  statusEvents: ShipmentStatusEvent[];
  trackingEvents: TrackingEvent[];
  exceptions: ShipmentException[];
  pods: ProofOfDelivery[];
  
  // Selectors / View Models
  getShipmentView: (shipmentId: string) => ShipmentView | undefined;
  getShipmentPackages: (shipmentId: string) => ShipmentPackage[];
  getShipmentOriginAddress: (shipmentId: string) => Address | undefined;
  getShipmentDestinationAddress: (shipmentId: string) => Address | undefined;
  getShipmentDriver: (shipmentId: string) => Driver | undefined;
  getShipmentRoute: (shipmentId: string) => Route | undefined;
  getRouteStopsByRoute: (routeId: string) => RouteStop[];
  getVehicleForDriver: (driverId: string) => Vehicle | undefined;
  getShipmentStatusHistory: (shipmentId: string) => ShipmentStatusEvent[];
  
  // Actions (Mock API Services)
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus, userId: string, location: string, note?: string) => void;
  createRoute: (route: Route, stops: RouteStop[]) => void;
  updateRouteStatus: (routeId: string, status: RouteStatus) => void;
  updateRouteStopStatus: (routeStopId: string, status: RouteStopStatus) => void;
  assignDriverToRoute: (routeId: string, driverId: string) => void;
  optimizeRoute: (routeId: string, result: OptimizationResult) => void;
  dispatchRoute: (routeId: string) => void;
  submitPOD: (pod: ProofOfDelivery) => void;
  createException: (exception: ShipmentException) => void;
  addShipment: (shipment: Shipment, pkgs: ShipmentPackage[]) => void;
  addDriver: (driver: Driver, vehicle?: Vehicle) => void;
  isShipmentEligibleForPlanning: (shipment: Shipment) => boolean;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [organizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [packages, setPackages] = useState<ShipmentPackage[]>(MOCK_PACKAGES);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [driverVehicleAssignments, setDriverVehicleAssignments] = useState<DriverVehicleAssignment[]>(MOCK_DRIVER_VEHICLE_ASSIGNMENTS);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [routeStops, setRouteStops] = useState<RouteStop[]>(MOCK_ROUTE_STOPS);
  const [statusEvents, setStatusEvents] = useState<ShipmentStatusEvent[]>(MOCK_STATUS_EVENTS);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>(MOCK_TRACKING_EVENTS);
  const [exceptions, setExceptions] = useState<ShipmentException[]>(MOCK_EXCEPTIONS);
  const [pods, setPods] = useState<ProofOfDelivery[]>(MOCK_PODS);

  // --- Selectors ---
  
  const getShipmentOriginAddress = (shipmentId: string) => {
    const s = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    return s ? addresses.find(a => a.id === s.originAddressId) : undefined;
  };

  const getShipmentDestinationAddress = (shipmentId: string) => {
    const s = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    return s ? addresses.find(a => a.id === s.destinationAddressId) : undefined;
  };

  const getShipmentPackages = (shipmentId: string) => packages.filter(p => p.shipmentId === shipmentId);
  const getShipmentDriver = (shipmentId: string) => {
    const s = shipments.find(x => x.id === shipmentId);
    return s && s.driverId ? drivers.find(d => d.id === s.driverId) : undefined;
  };
  const getShipmentRoute = (shipmentId: string) => {
    const s = shipments.find(x => x.id === shipmentId);
    return s && s.routeId ? routes.find(r => r.id === s.routeId) : undefined;
  };
  const getRouteStopsByRoute = (routeId: string) => routeStops.filter(s => s.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
  
  const getVehicleForDriver = (driverId: string) => {
    const d = drivers.find(drv => drv.id === driverId);
    if (d && d.vehicleId) {
      return vehicles.find(v => v.id === d.vehicleId);
    }
    const assignment = driverVehicleAssignments.find(a => a.driverId === driverId && !a.unassignedAt);
    return assignment ? vehicles.find(v => v.id === assignment.vehicleId) : undefined;
  };

  const getShipmentStatusHistory = (shipmentId: string) => statusEvents.filter(e => e.shipmentId === shipmentId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getShipmentView = (shipmentId: string): ShipmentView | undefined => {
    const shipment = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    if (!shipment) return undefined;
    const origin = getShipmentOriginAddress(shipment.id);
    const dest = getShipmentDestinationAddress(shipment.id);
    
    let progress = 0;
    if (shipment.status === 'Delivered') progress = 100;
    else if (shipment.status === 'Out for Delivery') progress = 90;
    else if (shipment.status === 'In Transit') progress = 50;
    else if (shipment.status === 'Picked Up') progress = 20;
    else if (shipment.status === 'Assigned') progress = 10;
    else if (shipment.status === 'Ready for Planning') progress = 5;

    return {
      ...shipment,
      originAddressLabel: origin ? `${origin.city}, ${origin.state}` : 'Unknown',
      destinationAddressLabel: dest ? `${dest.city}, ${dest.state}` : 'Unknown',
      progressPercentage: progress
    };
  };

  // --- Actions ---

  const updateShipmentStatus = (id: string, newStatus: ShipmentStatus, userId: string, location: string, note?: string) => {
    setShipments(prev => {
      const idx = prev.findIndex(s => s.id === id || s.trackingNumber === id);
      if (idx === -1) return prev;
      const shipment = prev[idx];
      
      if (!canTransitionShipmentStatus(shipment.status, newStatus)) return prev;

      const newEvent: ShipmentStatusEvent = {
        id: Date.now().toString(),
        shipmentId: shipment.id,
        previousStatus: shipment.status,
        newStatus: newStatus,
        timestamp: new Date().toISOString(),
        actorUserId: userId,
        actorType: 'USER',
        location: location,
        note
      };
      
      setStatusEvents(ePrev => [newEvent, ...ePrev]);
      
      const newShipments = [...prev];
      newShipments[idx] = { ...shipment, status: newStatus, updatedAt: new Date().toISOString() };
      return newShipments;
    });
  };

  const createRoute = (route: Route, stops: RouteStop[]) => {
    setRoutes(prev => [...prev, route]);
    setRouteStops(prev => [...prev, ...stops]);
    
    const shipmentIds = stops.map(s => s.shipmentId);
    
    setShipments(prev => prev.map(shipment => {
      if (shipmentIds.includes(shipment.id)) {
        const newEvent: ShipmentStatusEvent = {
          id: Date.now().toString() + shipment.id,
          shipmentId: shipment.id,
          previousStatus: shipment.status,
          newStatus: 'Planned',
          timestamp: new Date().toISOString(),
          actorUserId: null,
          actorType: 'SYSTEM'
        };
        setStatusEvents(ePrev => [newEvent, ...ePrev]);
        
        return {
          ...shipment,
          status: 'Planned',
          routeId: route.id,
          updatedAt: new Date().toISOString()
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
    const vehicle = getVehicleForDriver(driverId);
    if (!driver || !vehicle) return;
    
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'Assigned', driverId: driver.id, vehicleId: vehicle.id } : r));
    
    setRouteStops(prev => {
      const routeStopItems = prev.filter(s => s.routeId === routeId);
      const shipmentIds = routeStopItems.map(s => s.shipmentId);
      
      setShipments(sPrev => sPrev.map(shipment => {
        if (shipmentIds.includes(shipment.id)) {
          const newEvent: ShipmentStatusEvent = {
            id: Date.now().toString() + shipment.id,
            shipmentId: shipment.id,
            previousStatus: shipment.status,
            newStatus: 'Assigned',
            timestamp: new Date().toISOString(),
            actorUserId: null,
            actorType: 'SYSTEM'
          };
          setStatusEvents(ePrev => [newEvent, ...ePrev]);
          
          return {
            ...shipment,
            status: 'Assigned',
            driverId: driver.id,
            updatedAt: new Date().toISOString()
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
  };

  const submitPOD = (pod: ProofOfDelivery) => {
    setPods(prev => [...prev, pod]);
    updateShipmentStatus(pod.shipmentId, 'Delivered', 'SYSTEM', 'Delivery Location', pod.notes);
    
    setRouteStops(prev => prev.map(s => 
      s.shipmentId === pod.shipmentId ? { ...s, status: 'Completed', actualDeparture: new Date().toISOString() } : s
    ));
  };

  const createException = (exception: ShipmentException) => {
    setExceptions(prev => [...prev, exception]);
  };

  const addShipment = (shipment: Shipment, pkgs: ShipmentPackage[]) => {
    setShipments(prev => [shipment, ...prev]);
    if (pkgs && pkgs.length > 0) {
      setPackages(prev => [...pkgs, ...prev]);
    }
  };

  const addDriver = (driver: Driver, vehicle?: Vehicle) => {
    setDrivers(prev => [driver, ...prev]);
    if (vehicle) {
      setVehicles(prev => [vehicle, ...prev]);
    }
  };

  const isShipmentEligibleForPlanning = (shipment: Shipment) => {
    return shipment.status === 'Ready for Planning';
  };

  return (
    <DomainContext.Provider value={{ 
      organizations, addresses, shipments, packages, drivers, vehicles, driverVehicleAssignments, routes, routeStops, statusEvents, trackingEvents, exceptions, pods,
      getShipmentView, getShipmentPackages, getShipmentOriginAddress, getShipmentDestinationAddress, getShipmentDriver, getShipmentRoute, getRouteStopsByRoute, getVehicleForDriver, getShipmentStatusHistory,
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
