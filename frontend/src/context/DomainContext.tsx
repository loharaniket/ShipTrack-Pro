import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  MOCK_SHIPMENTS, MOCK_DRIVERS, MOCK_VEHICLES, MOCK_ROUTES, MOCK_ROUTE_STOPS, MOCK_EXCEPTIONS, MOCK_PODS,
  MOCK_ADDRESSES, MOCK_PACKAGES, MOCK_ORGANIZATIONS, MOCK_STATUS_EVENTS, MOCK_TRACKING_EVENTS, MOCK_DRIVER_VEHICLE_ASSIGNMENTS
} from '@/services/mockData';
import { 
  Shipment, Driver, Route, RouteStop, ShipmentException, ProofOfDelivery, 
  ShipmentStatusEvent, OptimizationResult,
  Address, ShipmentPackage, Vehicle, Organization, TrackingEvent, ShipmentView, DriverVehicleAssignment
} from '@/types/domain';
import { createRoute, updateRouteStatus, updateRouteStopStatus, assignDriverToRoute, dispatchRoute } from '@/services/routeService';
import { submitPOD } from '@/services/podService';
import { createException } from '@/services/exceptionService';
import { 
  CreateShipmentRequest, 
  UpdateShipmentStatusRequest, 
  CreateRouteRequest, 
  AssignDriverRequest, 
  UpdateRouteStatusRequest, 
  UpdateRouteStopStatusRequest, 
  DispatchRouteRequest, 
  SubmitPODRequest, 
  CreateExceptionRequest 
} from '@/types/api';

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
  updateShipmentStatus: (req: UpdateShipmentStatusRequest) => void;
  createRoute: (req: CreateRouteRequest, driverId?: string) => string | undefined;
  updateRouteStatus: (req: UpdateRouteStatusRequest) => void;
  updateRouteStopStatus: (req: UpdateRouteStopStatusRequest) => void;
  assignDriverToRoute: (req: AssignDriverRequest) => void;
  optimizeRoute: (routeId: string, result: OptimizationResult) => void;
  dispatchRoute: (req: DispatchRouteRequest) => void;
  submitPOD: (req: SubmitPODRequest) => void;
  createException: (req: CreateExceptionRequest) => void;
  addShipment: (req: CreateShipmentRequest) => void;
  addDriver: (driver: Driver, vehicle?: Vehicle) => void;
  isShipmentEligibleForPlanning: (shipment: Shipment) => boolean;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [addresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [packages, setPackages] = useState<ShipmentPackage[]>(MOCK_PACKAGES);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [driverVehicleAssignments, setDriverVehicleAssignments] = useState<DriverVehicleAssignment[]>(MOCK_DRIVER_VEHICLE_ASSIGNMENTS);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [routeStops, setRouteStops] = useState<RouteStop[]>(MOCK_ROUTE_STOPS);
  const [statusEvents, setStatusEvents] = useState<ShipmentStatusEvent[]>(MOCK_STATUS_EVENTS);
  const [trackingEvents] = useState<TrackingEvent[]>(MOCK_TRACKING_EVENTS);
  const [exceptions, setExceptions] = useState<ShipmentException[]>(MOCK_EXCEPTIONS);
  const [pods, setPods] = useState<ProofOfDelivery[]>(MOCK_PODS);

  React.useEffect(() => {
    // Fetch shipments from API when user logs in
    if (user) {
      import('@/services/shipmentService').then(({ shipmentService }) => {
        shipmentService.getShipments(0, 100).then(res => {
          setShipments(res.content);
        }).catch(err => console.error("Failed to fetch shipments:", err));
      });
    } else {
      setShipments([]);
    }
  }, [user]);

  // --- Selectors ---
  
  const getShipmentOriginAddress = (shipmentId: string) => {
    const s = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    return s ? addresses.find(a => a.id === s.originAddressId) : undefined;
  };

  const getShipmentDestinationAddress = (shipmentId: string) => {
    const s = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    return s ? addresses.find(a => a.id === s.destinationAddressId) : undefined;
  };

  const getShipmentPackages = (shipmentId: string) => {
    const s = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    if (s && s.packages && s.packages.length > 0) {
      return s.packages;
    }
    return packages.filter(p => p.shipmentId === shipmentId);
  };
  
  const getVehicleForDriver = (driverId: string) => {
    const assignment = driverVehicleAssignments
      .filter(
        item =>
          item.driverId === driverId &&
          !item.unassignedAt
      )
      .sort(
        (a, b) =>
          new Date(b.assignedAt).getTime() -
          new Date(a.assignedAt).getTime()
      )[0];

    if (!assignment) {
      return undefined;
    }

    return vehicles.find(
      vehicle => vehicle.id === assignment.vehicleId
    );
  };
  const getShipmentDriver = (shipmentId: string) => {
    const s = shipments.find(x => x.id === shipmentId);
    return s && s.driverId ? drivers.find(d => d.id === s.driverId) : undefined;
  };
  const getShipmentRoute = (shipmentId: string) => {
    const s = shipments.find(x => x.id === shipmentId);
    return s && s.routeId ? routes.find(r => r.id === s.routeId) : undefined;
  };
  const getRouteStopsByRoute = (routeId: string) => routeStops.filter(s => s.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
  
  const getShipmentStatusHistory = (shipmentId: string) => {
    const s = shipments.find(s => s.id === shipmentId || s.trackingNumber === shipmentId);
    if (s && s.history && s.history.length > 0) {
      return [...s.history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return statusEvents.filter(e => e.shipmentId === shipmentId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

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
      originAddressLabel: origin ? `${origin.city}, ${origin.state}` : shipment.originAddressLabel || 'Unknown',
      destinationAddressLabel: dest ? `${dest.city}, ${dest.state}` : shipment.destinationAddressLabel || 'Unknown',
      progressPercentage: progress
    };
  };

  // --- Actions ---

  const handleUpdateShipmentStatus = (req: UpdateShipmentStatusRequest) => {
    import('@/services/shipmentService').then(({ shipmentService }) => {
      shipmentService.updateShipmentStatus(req)
        .then(updatedShipment => {
           setShipments(prev => prev.map(s => s.id === updatedShipment.id ? updatedShipment : s));
        })
        .catch(err => { console.error(err); alert(err.message); });
    });
  };

  const handleCreateRoute = (req: CreateRouteRequest, driverId?: string) => {
    try {
      let result = createRoute(req, { routes, routeStops, shipments, statusEvents, drivers });
      
      const newRouteId = result.routes[result.routes.length - 1].id;
      
      if (driverId) {
        const assignResult = assignDriverToRoute(
          { routeId: newRouteId, driverId, actor: { type: 'SYSTEM', userId: null } },
          { routes: result.routes, routeStops: result.routeStops, shipments: result.shipments, statusEvents: result.statusEvents, drivers }
        );
        result = { ...result, routes: assignResult.routes, shipments: assignResult.shipments, statusEvents: assignResult.statusEvents };
      }

      setRoutes(result.routes);
      setRouteStops(result.routeStops);
      setShipments(result.shipments);
      setStatusEvents(result.statusEvents);
      
      return newRouteId;
    } catch (err: any) { console.error(err); alert(err.message); }
  };
  
  const handleUpdateRouteStatus = (req: UpdateRouteStatusRequest) => {
    try {
      const result = updateRouteStatus(req, { routes });
      setRoutes(result.routes);
    } catch (err: any) { console.error(err); alert(err.message); }
  };

  const handleUpdateRouteStopStatus = (req: UpdateRouteStopStatusRequest) => {
    try {
      const result = updateRouteStopStatus(req, { routeStops });
      setRouteStops(result.routeStops);
    } catch (err: any) { console.error(err); alert(err.message); }
  };

  const handleAssignDriverToRoute = (req: AssignDriverRequest) => {
    try {
      const result = assignDriverToRoute(req, { routes, routeStops, shipments, statusEvents });
      setRoutes(result.routes);
      setShipments(result.shipments);
      setStatusEvents(result.statusEvents);
    } catch (err: any) { console.error(err); alert(err.message); }
  };

  const handleDispatchRoute = (req: DispatchRouteRequest) => {
    try {
      const result = dispatchRoute(req, { routes, shipments });
      setRoutes(result.routes);
    } catch (err: any) { console.error(err); alert(err.message); }
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

  const handleSubmitPOD = (req: SubmitPODRequest) => {
    try {
      const result = submitPOD(req, { pods, shipments, statusEvents, routeStops });
      setPods(result.pods);
      setShipments(result.shipments);
      setStatusEvents(result.statusEvents);
      setRouteStops(result.routeStops);
    } catch (err: any) { console.error(err); alert(err.message); }
  };

  const handleCreateException = (req: CreateExceptionRequest) => {
    try {
      const result = createException(req, { exceptions, shipments, routes });
      setExceptions(result.exceptions);
    } catch (err: any) { console.error(err); alert(err.message); }
  };

  const handleAddShipment = (req: CreateShipmentRequest) => {
    import('@/services/shipmentService').then(({ shipmentService }) => {
      shipmentService.createShipment(req)
        .then(newShipment => {
          setShipments(prev => [newShipment, ...prev]);
        })
        .catch(err => { console.error(err); alert(err.message); });
    });
  };

  const addDriver = (driver: Driver, vehicle?: Vehicle) => {
    setDrivers(prev => [driver, ...prev]);

    if (!vehicle) {
      return;
    }

    setVehicles(prev => [vehicle, ...prev]);

    const assignment: DriverVehicleAssignment = {
      id: `DVA-${Date.now()}`,
      driverId: driver.id,
      vehicleId: vehicle.id,
      assignedAt: new Date().toISOString()
    };

    setDriverVehicleAssignments(prev => [
      assignment,
      ...prev
    ]);
  };

  const isShipmentEligibleForPlanning = (shipment: Shipment) => {
    return shipment.status === 'Ready for Planning';
  };

  return (
    <DomainContext.Provider value={{ 
      organizations, addresses, shipments, packages, drivers, vehicles, driverVehicleAssignments, routes, routeStops, statusEvents, trackingEvents, exceptions, pods,
      getShipmentView, getShipmentPackages, getShipmentOriginAddress, getShipmentDestinationAddress, getShipmentDriver, getShipmentRoute, getRouteStopsByRoute, getVehicleForDriver, getShipmentStatusHistory,
      updateShipmentStatus: handleUpdateShipmentStatus, 
      createRoute: handleCreateRoute, 
      updateRouteStatus: handleUpdateRouteStatus, 
      updateRouteStopStatus: handleUpdateRouteStopStatus,
      assignDriverToRoute: handleAssignDriverToRoute, 
      optimizeRoute, 
      dispatchRoute: handleDispatchRoute, 
      submitPOD: handleSubmitPOD, 
      createException: handleCreateException, 
      addShipment: handleAddShipment, 
      addDriver,
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
