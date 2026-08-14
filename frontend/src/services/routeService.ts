import {
  Route,
  RouteStop,
  Shipment,
  ShipmentStatusEvent,
  Driver
} from '../types/domain';

import {
  CreateRouteRequest,
  AssignDriverRequest,
  UpdateRouteStatusRequest,
  UpdateRouteStopStatusRequest,
  DispatchRouteRequest
} from '../types/api';

import {
  canTransitionRouteStatus,
  canTransitionRouteStopStatus,
  canTransitionShipmentStatus
} from '../utils/statusTransitions';

interface RouteServiceState {
  routes: Route[];
  routeStops: RouteStop[];
  shipments: Shipment[];
  statusEvents: ShipmentStatusEvent[];
  drivers?: Driver[];
}

const getRequiredShipments = (
  shipmentIds: string[],
  shipments: Shipment[]
): Shipment[] => {
  const uniqueIds = [...new Set(shipmentIds)];

  if (uniqueIds.length !== shipmentIds.length) {
    throw new Error('Duplicate shipment IDs are not allowed');
  }

  const resolved = uniqueIds.map(id => {
    const shipment = shipments.find(item => item.id === id);

    if (!shipment) {
      throw new Error(`Shipment not found: ${id}`);
    }

    return shipment;
  });

  return resolved;
};

export const createRoute = (
  req: CreateRouteRequest,
  state: RouteServiceState
) => {
  const {
    routes,
    routeStops,
    shipments,
    statusEvents
  } = state;

  if (!req.name.trim()) {
    throw new Error('Route name is required');
  }

  if (req.shipmentIds.length === 0) {
    throw new Error('At least one shipment is required');
  }

  const selectedShipments = getRequiredShipments(
    req.shipmentIds,
    shipments
  );

  for (const shipment of selectedShipments) {
    if (shipment.routeId) {
      throw new Error(
        `Shipment ${shipment.id} is already assigned to route ${shipment.routeId}`
      );
    }

    if (
      !canTransitionShipmentStatus(
        shipment.status,
        'Planned'
      )
    ) {
      throw new Error(
        `Shipment ${shipment.id} cannot transition from ${shipment.status} to Planned`
      );
    }
  }

  const routeId = `RT-${Date.now()}`;
  const now = new Date().toISOString();

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

  const newStops: RouteStop[] =
    selectedShipments.map((shipment, index) => ({
      id: `STP-${Date.now()}-${index}`,
      routeId,
      shipmentId: shipment.id,
      addressId: shipment.destinationAddressId,
      sequence: index + 1,
      status: 'Pending'
    }));

  const newShipments = [...shipments];
  const newEvents = [...statusEvents];

  for (const shipment of selectedShipments) {
    const index = newShipments.findIndex(
      item => item.id === shipment.id
    );

    newShipments[index] = {
      ...shipment,
      status: 'Planned',
      routeId,
      updatedAt: now
    };

    newEvents.unshift({
      id: `SE-${Date.now()}-${shipment.id}`,
      shipmentId: shipment.id,
      previousStatus: shipment.status,
      newStatus: 'Planned',
      actorType: 'SYSTEM',
      actorUserId: null,
      timestamp: now,
      note: `Shipment planned on route ${routeId}`
    });
  }

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

  const index = routes.findIndex(
    route => route.id === req.routeId
  );

  if (index === -1) {
    throw new Error(`Route not found: ${req.routeId}`);
  }

  const route = routes[index];

  if (
    !canTransitionRouteStatus(
      route.status,
      req.newStatus
    )
  ) {
    throw new Error(
      `Invalid route transition: ${route.status} -> ${req.newStatus}`
    );
  }

  const now = new Date().toISOString();

  const updatedRoute: Route = {
    ...route,
    status: req.newStatus,
    actualStart:
      req.newStatus === 'In Progress'
        ? route.actualStart ?? now
        : route.actualStart,
    actualEnd:
      req.newStatus === 'Completed'
        ? route.actualEnd ?? now
        : route.actualEnd
  };

  const newRoutes = [...routes];
  newRoutes[index] = updatedRoute;

  return {
    routes: newRoutes
  };
};

export const updateRouteStopStatus = (
  req: UpdateRouteStopStatusRequest,
  state: { routeStops: RouteStop[] }
) => {
  const { routeStops } = state;

  const index = routeStops.findIndex(
    stop => stop.id === req.routeStopId
  );

  if (index === -1) {
    throw new Error(
      `Route stop not found: ${req.routeStopId}`
    );
  }

  const stop = routeStops[index];

  if (
    !canTransitionRouteStopStatus(
      stop.status,
      req.newStatus
    )
  ) {
    throw new Error(
      `Invalid route stop transition: ${stop.status} -> ${req.newStatus}`
    );
  }

  const now = new Date().toISOString();

  const updatedStop: RouteStop = {
    ...stop,
    status: req.newStatus,
    actualArrival:
      req.actualArrival ??
      (req.newStatus === 'Arrived'
        ? now
        : stop.actualArrival),
    actualDeparture:
      req.actualDeparture ??
      (req.newStatus === 'Completed'
        ? now
        : stop.actualDeparture)
  };

  const newStops = [...routeStops];
  newStops[index] = updatedStop;

  return {
    routeStops: newStops
  };
};

export const assignDriverToRoute = (
  req: AssignDriverRequest,
  state: RouteServiceState
) => {
  const {
    routes,
    routeStops,
    shipments,
    statusEvents,
    drivers = []
  } = state;

  const routeIndex = routes.findIndex(
    route => route.id === req.routeId
  );

  if (routeIndex === -1) {
    throw new Error(`Route not found: ${req.routeId}`);
  }

  if (
    drivers.length > 0 &&
    !drivers.some(driver => driver.id === req.driverId)
  ) {
    throw new Error(`Driver not found: ${req.driverId}`);
  }

  const route = routes[routeIndex];

  if (
    !canTransitionRouteStatus(
      route.status,
      'Assigned'
    )
  ) {
    throw new Error(
      `Invalid route transition: ${route.status} -> Assigned`
    );
  }

  const routeStopItems = routeStops.filter(
    stop => stop.routeId === req.routeId
  );

  if (routeStopItems.length === 0) {
    throw new Error(
      `Route ${req.routeId} has no route stops`
    );
  }

  const shipmentIds = routeStopItems.map(
    stop => stop.shipmentId
  );

  const selectedShipments = getRequiredShipments(
    shipmentIds,
    shipments
  );

  for (const shipment of selectedShipments) {
    if (shipment.routeId !== req.routeId) {
      throw new Error(
        `Shipment ${shipment.id} is not linked to route ${req.routeId}`
      );
    }

    if (
      !canTransitionShipmentStatus(
        shipment.status,
        'Assigned'
      )
    ) {
      throw new Error(
        `Shipment ${shipment.id} cannot transition from ${shipment.status} to Assigned`
      );
    }
  }

  const newRoutes = [...routes];

  newRoutes[routeIndex] = {
    ...route,
    status: 'Assigned',
    driverId: req.driverId
  };

  const newShipments = [...shipments];
  const newEvents = [...statusEvents];
  const now = new Date().toISOString();

  for (const shipment of selectedShipments) {
    const index = newShipments.findIndex(
      item => item.id === shipment.id
    );

    newShipments[index] = {
      ...shipment,
      status: 'Assigned',
      driverId: req.driverId,
      routeId: req.routeId,
      updatedAt: now
    };

    newEvents.unshift({
      id: `SE-${Date.now()}-${shipment.id}`,
      shipmentId: shipment.id,
      previousStatus: shipment.status,
      newStatus: 'Assigned',
      actorType: req.actor.type,
      actorUserId: req.actor.userId,
      timestamp: now,
      note: `Driver ${req.driverId} assigned to route ${req.routeId}`
    });
  }

  return {
    routes: newRoutes,
    shipments: newShipments,
    statusEvents: newEvents
  };
};

export const dispatchRoute = (
  req: DispatchRouteRequest,
  state: {
    routes: Route[];
    shipments: Shipment[];
  }
) => {
  const { routes, shipments } = state;

  const index = routes.findIndex(
    route => route.id === req.routeId
  );

  if (index === -1) {
    throw new Error(`Route not found: ${req.routeId}`);
  }

  const route = routes[index];

  if (
    !canTransitionRouteStatus(
      route.status,
      'Dispatched'
    )
  ) {
    throw new Error(
      `Invalid route transition: ${route.status} -> Dispatched`
    );
  }

  const routeShipments = shipments.filter(
    shipment => shipment.routeId === req.routeId
  );

  if (routeShipments.length === 0) {
    throw new Error(
      `Route ${req.routeId} has no shipments`
    );
  }

  for (const shipment of routeShipments) {
    if (shipment.status !== 'Assigned') {
      throw new Error(
        `Shipment ${shipment.id} must be Assigned before route dispatch`
      );
    }
  }

  const newRoutes = [...routes];

  newRoutes[index] = {
    ...route,
    status: 'Dispatched'
  };

  return {
    routes: newRoutes
  };
};
