import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  MOCK_EXCEPTIONS, MOCK_PODS,
  MOCK_ADDRESSES, MOCK_PACKAGES, MOCK_ORGANIZATIONS, MOCK_STATUS_EVENTS, MOCK_TRACKING_EVENTS, MOCK_DRIVER_VEHICLE_ASSIGNMENTS
} from '@/services/mockData';
import { 
  Shipment, Driver, Route, RouteStop, ShipmentException, ProofOfDelivery, 
  ShipmentStatusEvent, OptimizationResult,
  Address, ShipmentPackage, Vehicle, Organization, TrackingEvent, ShipmentView, DriverVehicleAssignment
} from '@/types/domain';
import { routeService } from '@/services/routeService';
import { deliveryApi } from '@/services/api/deliveryApi';
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
  
  // Actions
  updateShipmentStatus: (req: UpdateShipmentStatusRequest) => void;
  createRoute: (req: CreateRouteRequest, driverId?: string) => void;
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
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverVehicleAssignments] = useState<DriverVehicleAssignment[]>(MOCK_DRIVER_VEHICLE_ASSIGNMENTS);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [statusEvents, setStatusEvents] = useState<ShipmentStatusEvent[]>(MOCK_STATUS_EVENTS);
  const [trackingEvents] = useState<TrackingEvent[]>(MOCK_TRACKING_EVENTS);
  const [exceptions, setExceptions] = useState<ShipmentException[]>(MOCK_EXCEPTIONS);
  const [pods, setPods] = useState<ProofOfDelivery[]>(MOCK_PODS);

  // Legacy DomainProvider state preserved for backward compatibility
  React.useEffect(() => {
    if (!user) {
      setShipments([]);
      setRoutes([]);
      setRouteStops([]);
      setDrivers([]);
      setVehicles([]);
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
    const d = drivers.find(drv => drv.id === driverId);
    if (d && d.vehicleId) {
      const v = vehicles.find(veh => veh.id === d.vehicleId);
      if (v) return v;
    }
    // Match by driver ID or vehicleId directly
    return vehicles.find(v => v.id === driverId || (d && d.vehicleId && v.id === d.vehicleId));
  };

  const getShipmentDriver = (shipmentId: string) => {
    const s = shipments.find(x => x.id === shipmentId);
    if (s && s.driverId) {
      return drivers.find(d => d.id === s.driverId);
    }
    if (s && s.routeId) {
      const r = routes.find(route => route.id === s.routeId);
      if (r && r.driverId) {
        return drivers.find(d => d.id === r.driverId);
      }
    }
    const stop = routeStops.find(rs => rs.shipmentId === shipmentId);
    if (stop && stop.routeId) {
      const r = routes.find(route => route.id === stop.routeId);
      if (r && r.driverId) {
        return drivers.find(d => d.id === r.driverId);
      }
    }
    return undefined;
  };

  const getShipmentRoute = (shipmentId: string) => {
    const s = shipments.find(x => x.id === shipmentId);
    if (s && s.routeId) {
      return routes.find(r => r.id === s.routeId);
    }
    const stop = routeStops.find(rs => rs.shipmentId === shipmentId);
    if (stop && stop.routeId) {
      return routes.find(r => r.id === stop.routeId);
    }
    return undefined;
  };

  const getRouteStopsByRoute = (routeId: string) =>
    routeStops.filter(s => s.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
  
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

    const origin = addresses.find(a => a.id === shipment.originAddressId);
    const dest = addresses.find(a => a.id === shipment.destinationAddressId);

    let progress = 0;
    if (shipment.status === 'Delivered') progress = 100;
    else if (shipment.status === 'Out for Delivery') progress = 80;
    else if (shipment.status === 'In Transit') progress = 50;
    else if (shipment.status === 'Picked Up') progress = 25;
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
    routeService.createRoute(req, driverId)
      .then(({ route, stops }) => {
        setRoutes(prev => [route, ...prev]);
        setRouteStops(prev => [...stops, ...prev]);
        import('@/services/shipmentService').then(({ shipmentService }) => {
          shipmentService.getShipments(0, 100).then(res => setShipments(res.content));
        });
      })
      .catch(err => {
        console.error("Failed to create route:", err);
        alert(err.message || 'Failed to create route');
      });
  };
  
  const handleUpdateRouteStatus = (req: UpdateRouteStatusRequest) => {
    routeService.updateRouteStatus(req)
      .then(updatedRoute => {
        setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
      })
      .catch(err => {
        console.error("Failed to update route status:", err);
        alert(err.message || 'Failed to update route status');
      });
  };

  const handleUpdateRouteStopStatus = (req: UpdateRouteStopStatusRequest) => {
    const stop = routeStops.find(s => s.id === req.routeStopId);
    const targetRouteId = stop ? stop.routeId : (routes[0]?.id || '');
    if (!targetRouteId) return;

    routeService.updateRouteStopStatus(targetRouteId, req)
      .then(updatedStop => {
        setRouteStops(prev => prev.map(s => s.id === updatedStop.id ? updatedStop : s));
      })
      .catch(err => {
        console.error("Failed to update stop status:", err);
        alert(err.message || 'Failed to update stop status');
      });
  };

  const handleAssignDriverToRoute = (req: AssignDriverRequest) => {
    routeService.assignDriverToRoute(req)
      .then(updatedRoute => {
        setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
      })
      .catch(err => {
        console.error("Failed to assign driver:", err);
        alert(err.message || 'Failed to assign driver');
      });
  };

  const handleDispatchRoute = (req: DispatchRouteRequest) => {
    routeService.dispatchRoute(req)
      .then(updatedRoute => {
        setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
      })
      .catch(err => {
        console.error("Failed to dispatch route:", err);
        alert(err.message || 'Failed to dispatch route');
      });
  };

  const optimizeRoute = (routeId: string, result: OptimizationResult) => {
    routeService.optimizeRoute(routeId, result.optimizedStopSequence)
      .then(({ route, stops }) => {
        setRoutes(prev => prev.map(r => r.id === route.id ? route : r));
        setRouteStops(prev => {
          const otherStops = prev.filter(s => s.routeId !== routeId);
          return [...otherStops, ...stops];
        });
      })
      .catch(err => {
        console.error("Failed to optimize route:", err);
        alert(err.message || 'Failed to optimize route');
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
      const result = createException(req, { exceptions, shipments, statusEvents });
      setExceptions(result.exceptions);
      setShipments(result.shipments);
      setStatusEvents(result.statusEvents);
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

  const handleAddDriver = (driver: Driver, vehicle?: Vehicle) => {
    deliveryApi.createDriver({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      vehicleRegistration: vehicle?.registrationNumber,
      vehicleType: vehicle?.type,
      vehicleCapacityKg: vehicle?.capacityKg,
      status: driver.status || 'Active'
    }).then(res => {
      const newDriver: Driver = {
        id: res.id,
        name: res.name,
        phone: res.phone,
        email: res.email,
        status: (res.status as any) || 'Active',
        vehicleId: res.vehicleId || undefined
      };
      setDrivers(prev => [newDriver, ...prev]);
      if (res.vehicle) {
        const newVehicle: Vehicle = {
          id: res.vehicle.id,
          registrationNumber: res.vehicle.registrationNumber,
          type: res.vehicle.type,
          capacityKg: res.vehicle.capacityKg,
          status: (res.vehicle.status as any) || 'Active'
        };
        setVehicles(prev => [newVehicle, ...prev]);
      }
      alert('Driver added successfully!');
    }).catch(err => {
      console.error("Failed to add driver:", err);
      alert('Failed to add driver: ' + (err.message || 'Error'));
    });
  };

  const isShipmentEligibleForPlanning = (shipment: Shipment) => {
    return !shipment.routeId && (shipment.status === 'Ready for Planning' || shipment.status === 'Draft');
  };

  return (
    <DomainContext.Provider value={{
      organizations,
      addresses,
      shipments,
      packages,
      drivers,
      vehicles,
      driverVehicleAssignments,
      routes,
      routeStops,
      statusEvents,
      trackingEvents,
      exceptions,
      pods,
      getShipmentView,
      getShipmentPackages,
      getShipmentOriginAddress,
      getShipmentDestinationAddress,
      getShipmentDriver,
      getShipmentRoute,
      getRouteStopsByRoute,
      getVehicleForDriver,
      getShipmentStatusHistory,
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
      addDriver: handleAddDriver,
      isShipmentEligibleForPlanning
    }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
}
