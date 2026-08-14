import { Route, RouteStop, Shipment, ShipmentStatusEvent } from '../types/domain';
import { CreateRouteRequest, AssignDriverRequest, UpdateRouteStatusRequest, UpdateRouteStopStatusRequest, DispatchRouteRequest } from '../types/api';
import { canTransitionRouteStatus, canTransitionRouteStopStatus, canTransitionShipmentStatus } from '../utils/statusTransitions';

export const createRoute = (
  req: CreateRouteRequest,
  state: { routes: Route[]; routeStops: RouteStop[]; shipments: Shipment[]; statusEvents: ShipmentStatusEvent[] }
) => {
  const { routes, routeStops, shipments, statusEvents } = state;
  const routeId = `RT-${Date.now()}`;

  const newRoute: Route = {
    id: routeId,
    name: req.name,
    driverId: null,
    vehicleId: null,
    status: 'Draft',
    plannedStart: req.plannedStart,
    plannedEnd: req.plannedEnd,
    distance: 0,
    duration: 0
  };

  const newStops: RouteStop[] = req.shipmentIds.map((shipmentId, index) => {
    return {
      id: `STP-${Date.now()}-${index}`,
      routeId,
      shipmentId,
      sequence: index + 1,
      status: 'Pending'
    };
  });

  // Automatically transition shipment statuses to 'Planned'
  const newShipments = [...shipments];
  const newEvents = [...statusEvents];

  req.shipmentIds.forEach(shipmentId => {
    const idx = newShipments.findIndex(s => s.id === shipmentId);
    if (idx !== -1) {
      const s = newShipments[idx];
      if (canTransitionShipmentStatus(s.status, 'Planned')) {
        newShipments[idx] = { ...s, status: 'Planned', routeId, updatedAt: new Date().toISOString() };
        newEvents.unshift({
          id: `${Date.now()}-${shipmentId}`,
          shipmentId,
          previousStatus: s.status,
          newStatus: 'Planned',
          actorUserId: null,
          actorType: 'SYSTEM',
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  return {
    routes: [...routes, newRoute],
    routeStops: [...routeStops, ...newStops],
    shipments: newShipments,
    statusEvents: newEvents
  };
};

export const updateRouteStatus = (
  req: UpdateRouteStatusRequest,
  state: { routes: Route[] }
) => {
  const { routes } = state;
  const idx = routes.findIndex(r => r.id === req.routeId);
  if (idx === -1) throw new Error('Route not found');

  const route = routes[idx];
  
  if (!canTransitionRouteStatus(route.status, req.newStatus)) {
    throw new Error(`Invalid route transition from ${route.status} to ${req.newStatus}`);
  }

  const newRoutes = [...routes];
  newRoutes[idx] = { ...route, status: req.newStatus };

  return { routes: newRoutes };
};

export const updateRouteStopStatus = (
  req: UpdateRouteStopStatusRequest,
  state: { routeStops: RouteStop[] }
) => {
  const { routeStops } = state;
  const idx = routeStops.findIndex(s => s.id === req.routeStopId);
  if (idx === -1) throw new Error('RouteStop not found');

  const stop = routeStops[idx];

  if (!canTransitionRouteStopStatus(stop.status, req.newStatus)) {
    throw new Error(`Invalid route stop transition from ${stop.status} to ${req.newStatus}`);
  }

  const newStops = [...routeStops];
  newStops[idx] = { 
    ...stop, 
    status: req.newStatus, 
    actualArrival: req.actualArrival || stop.actualArrival,
    actualDeparture: req.actualDeparture || stop.actualDeparture
  };

  return { routeStops: newStops };
};

export const assignDriverToRoute = (
  req: AssignDriverRequest,
  state: { routes: Route[]; routeStops: RouteStop[]; shipments: Shipment[]; statusEvents: ShipmentStatusEvent[] }
) => {
  const { routes, routeStops, shipments, statusEvents } = state;
  const idx = routes.findIndex(r => r.id === req.routeId);
  if (idx === -1) throw new Error('Route not found');

  const route = routes[idx];
  if (!canTransitionRouteStatus(route.status, 'Assigned')) {
    throw new Error(`Invalid route transition from ${route.status} to Assigned`);
  }

  const newRoutes = [...routes];
  newRoutes[idx] = { ...route, status: 'Assigned', driverId: req.driverId };

  const routeStopItems = routeStops.filter(s => s.routeId === req.routeId);
  const shipmentIds = routeStopItems.map(s => s.shipmentId);

  const newShipments = [...shipments];
  const newEvents = [...statusEvents];

  shipmentIds.forEach(shipmentId => {
    const sIdx = newShipments.findIndex(s => s.id === shipmentId);
    if (sIdx !== -1) {
      const s = newShipments[sIdx];
      if (canTransitionShipmentStatus(s.status, 'Assigned')) {
        newShipments[sIdx] = { ...s, status: 'Assigned', driverId: req.driverId, updatedAt: new Date().toISOString() };
        newEvents.unshift({
          id: `${Date.now()}-${shipmentId}`,
          shipmentId: shipmentId,
          previousStatus: s.status,
          newStatus: 'Assigned',
          actorUserId: req.actor.userId,
          actorType: req.actor.type,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  return { routes: newRoutes, shipments: newShipments, statusEvents: newEvents };
};

export const dispatchRoute = (
  req: DispatchRouteRequest,
  state: { routes: Route[] }
) => {
  const { routes } = state;
  const idx = routes.findIndex(r => r.id === req.routeId);
  if (idx === -1) throw new Error('Route not found');

  const route = routes[idx];
  if (!canTransitionRouteStatus(route.status, 'Dispatched')) {
    throw new Error(`Invalid route transition from ${route.status} to Dispatched`);
  }

  const newRoutes = [...routes];
  newRoutes[idx] = { ...route, status: 'Dispatched' };

  return { routes: newRoutes };
};
