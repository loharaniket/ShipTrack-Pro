import { ShipmentStatus, RouteStatus, RouteStopStatus } from '../types/domain';

export const canTransitionShipmentStatus = (currentStatus: ShipmentStatus, nextStatus: ShipmentStatus): boolean => {
  const allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
    'Draft': ['Ready for Planning', 'Cancelled'],
    'Ready for Planning': ['Planned', 'Cancelled'],
    'Planned': ['Assigned', 'Cancelled'],
    'Assigned': ['Picked Up', 'Cancelled'],
    'Picked Up': ['In Transit', 'Failed'],
    'In Transit': ['Out for Delivery', 'Failed'],
    'Out for Delivery': ['Delivered', 'Failed'],
    'Delivered': [],
    'Failed': [],
    'Cancelled': []
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
};

export const canTransitionRouteStatus = (currentStatus: RouteStatus, nextStatus: RouteStatus): boolean => {
  const allowedTransitions: Record<RouteStatus, RouteStatus[]> = {
    'Draft': ['Planned', 'Cancelled'],
    'Planned': ['Assigned', 'Cancelled'],
    'Assigned': ['Dispatched', 'Cancelled'],
    'Dispatched': ['In Progress', 'Cancelled'],
    'In Progress': ['Completed', 'Exception', 'Cancelled'],
    'Completed': [],
    'Exception': ['In Progress', 'Completed', 'Cancelled'],
    'Cancelled': []
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
};

export const canTransitionRouteStopStatus = (currentStatus: RouteStopStatus, nextStatus: RouteStopStatus): boolean => {
  const allowedTransitions: Record<RouteStopStatus, RouteStopStatus[]> = {
    'Pending': ['Arrived', 'Skipped', 'Failed'],
    'Arrived': ['Completed', 'Failed'],
    'Completed': [],
    'Skipped': [],
    'Failed': []
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
};
