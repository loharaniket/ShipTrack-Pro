import {
  Route,
  RouteStop,
  RouteStatus,
  RouteStopStatus,
  Shipment,
  ShipmentStatusEvent
} from '../types/domain';

import {
  CreateRouteRequest,
  AssignDriverRequest,
  UpdateRouteStatusRequest,
  UpdateRouteStopStatusRequest,
  DispatchRouteRequest
} from '../types/api';

import { routeApi, BackendRouteResponse, BackendRouteStopResponse } from './api/routeApi';

const mapBackendRouteStatus = (status: string): RouteStatus => {
  const map: Record<string, RouteStatus> = {
    'DRAFT': 'Draft',
    'PLANNED': 'Planned',
    'ASSIGNED': 'Assigned',
    'DISPATCHED': 'Dispatched',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'Draft': 'Draft',
    'Planned': 'Planned',
    'Assigned': 'Assigned',
    'Dispatched': 'Dispatched',
    'In Progress': 'In Progress',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled'
  };
  return map[status] || 'Draft';
};

const mapBackendStopStatus = (status: string): RouteStopStatus => {
  const map: Record<string, RouteStopStatus> = {
    'PENDING': 'Pending',
    'ARRIVED': 'Arrived',
    'COMPLETED': 'Completed',
    'SKIPPED': 'Skipped',
    'FAILED': 'Failed',
    'Pending': 'Pending',
    'Arrived': 'Arrived',
    'Completed': 'Completed',
    'Skipped': 'Skipped',
    'Failed': 'Failed'
  };
  return map[status] || 'Pending';
};

export const mapBackendRouteToFrontend = (res: BackendRouteResponse): Route => {
  return {
    id: res.id,
    name: res.name,
    driverId: res.driverId || null,
    vehicleId: null,
    status: mapBackendRouteStatus(res.status),
    plannedStart: res.plannedStart || undefined,
    plannedEnd: res.plannedEnd || undefined,
    actualStart: res.actualStart || undefined,
    actualEnd: res.actualEnd || undefined,
    distance: res.totalDistanceKm || 0,
    duration: res.totalDurationMinutes || 0
  };
};

export const mapBackendStopToFrontend = (res: BackendRouteStopResponse): RouteStop => {
  return {
    id: res.id,
    routeId: res.routeId,
    shipmentId: res.shipmentId,
    sequence: res.stopOrder,
    status: mapBackendStopStatus(res.status),
    plannedArrival: res.plannedArrival || undefined,
    actualArrival: res.actualArrival || undefined,
    actualDeparture: res.actualDeparture || undefined
  };
};

// Pure in-memory helper for POD service backward compatibility
export const updateRouteStopStatus = (
  req: UpdateRouteStopStatusRequest,
  state: { routeStops: RouteStop[] }
) => {
  const { routeStops } = state;
  const index = routeStops.findIndex(stop => stop.id === req.routeStopId);
  if (index === -1) {
    return { routeStops };
  }
  const stop = routeStops[index];
  const now = new Date().toISOString();
  const updatedStop: RouteStop = {
    ...stop,
    status: req.newStatus,
    actualArrival: req.actualArrival ?? (req.newStatus === 'Arrived' ? now : stop.actualArrival),
    actualDeparture: req.actualDeparture ?? (req.newStatus === 'Completed' ? now : stop.actualDeparture)
  };
  const newStops = [...routeStops];
  newStops[index] = updatedStop;
  return { routeStops: newStops };
};

export const routeService = {
  getRoutes: async (status?: string): Promise<Route[]> => {
    const backendStatus = status ? status.toUpperCase().replace(/\s+/g, '_') : undefined;
    const res = await routeApi.getAll(backendStatus);
    return res.map(mapBackendRouteToFrontend);
  },

  getRouteDetails: async (routeId: string): Promise<{ route: Route; stops: RouteStop[] }> => {
    const res = await routeApi.getById(routeId);
    const route = mapBackendRouteToFrontend(res);
    const stops = (res.stops || []).map(mapBackendStopToFrontend);
    return { route, stops };
  },

  getDriverCurrentRoute: async (): Promise<{ routes: Route[]; stops: RouteStop[] }> => {
    const res = await routeApi.getDriverCurrentRoute();
    const routes = res.map(mapBackendRouteToFrontend);
    const allStops: RouteStop[] = [];
    for (const r of res) {
      if (r.stops) {
        allStops.push(...r.stops.map(mapBackendStopToFrontend));
      }
    }
    return { routes, stops: allStops };
  },

  createRoute: async (req: CreateRouteRequest, driverId?: string): Promise<{ route: Route; stops: RouteStop[] }> => {
    const payload = {
      name: req.name,
      shipmentIds: req.shipmentIds,
      driverId: driverId || undefined,
      plannedStart: req.plannedStart,
      plannedEnd: req.plannedEnd
    };
    const res = await routeApi.planRoute(payload);
    const route = mapBackendRouteToFrontend(res);
    const details = await routeApi.getById(res.id);
    const stops = (details.stops || []).map(mapBackendStopToFrontend);
    return { route, stops };
  },

  assignDriverToRoute: async (req: AssignDriverRequest): Promise<Route> => {
    const res = await routeApi.assignDriver(req.routeId, { driverId: req.driverId });
    return mapBackendRouteToFrontend(res);
  },

  dispatchRoute: async (req: DispatchRouteRequest): Promise<Route> => {
    const res = await routeApi.dispatch(req.routeId);
    return mapBackendRouteToFrontend(res);
  },

  updateRouteStatus: async (req: UpdateRouteStatusRequest): Promise<Route> => {
    const backendStatus = req.newStatus.toUpperCase().replace(/\s+/g, '_');
    const res = await routeApi.updateStatus(req.routeId, backendStatus);
    return mapBackendRouteToFrontend(res);
  },

  updateRouteStopStatus: async (routeId: string, req: UpdateRouteStopStatusRequest): Promise<RouteStop> => {
    const backendStatus = req.newStatus.toUpperCase().replace(/\s+/g, '_');
    const res = await routeApi.updateStopStatus(routeId, req.routeStopId, {
      status: backendStatus,
      actualArrival: req.actualArrival,
      actualDeparture: req.actualDeparture
    });
    return mapBackendStopToFrontend(res);
  },

  optimizeRoute: async (routeId: string, optimizedStopSequence?: string[]): Promise<{ route: Route; stops: RouteStop[] }> => {
    const res = await routeApi.optimizeRoute(routeId, { optimizedStopSequence });
    const route = mapBackendRouteToFrontend(res);
    const stops = (res.stops || []).map(mapBackendStopToFrontend);
    return { route, stops };
  }
};
