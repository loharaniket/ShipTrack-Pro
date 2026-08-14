import {
  ProofOfDelivery,
  Shipment,
  ShipmentStatusEvent,
  RouteStop
} from '../types/domain';

import { SubmitPODRequest } from '../types/api';

import { updateShipmentStatus } from './shipmentService';
import { updateRouteStopStatus } from './routeService';

interface PODServiceState {
  pods: ProofOfDelivery[];
  shipments: Shipment[];
  statusEvents: ShipmentStatusEvent[];
  routeStops: RouteStop[];
}

export const submitPOD = (
  req: SubmitPODRequest,
  state: PODServiceState
) => {
  const {
    pods,
    shipments,
    statusEvents,
    routeStops
  } = state;

  const shipment = shipments.find(
    item =>
      item.id === req.shipmentId ||
      item.trackingNumber === req.shipmentId
  );

  if (!shipment) {
    throw new Error(
      `Shipment not found: ${req.shipmentId}`
    );
  }

  if (
    req.deliveryResult === 'SUCCESS' &&
    !['Out for Delivery', 'In Transit'].includes(
      shipment.status
    )
  ) {
    throw new Error(
      `Shipment ${shipment.id} cannot be delivered from ${shipment.status}`
    );
  }

  if (!req.recipientName.trim()) {
    throw new Error(
      'Recipient name is required'
    );
  }

  const now = new Date().toISOString();

  const newPOD: ProofOfDelivery = {
    id: `POD-${Date.now()}`,
    shipmentId: shipment.id,
    routeStopId: req.routeStopId,
    driverId: req.driverId,
    recipientName: req.recipientName,
    deliveredAt: now,
    signatureMediaId: req.signatureMediaId,
    photoMediaIds: req.photoMediaIds,
    notes: req.notes,
    latitude: req.latitude,
    longitude: req.longitude,
    deliveryResult: req.deliveryResult,
    actorType: req.actor.type,
    actorUserId: req.actor.userId
  };

  const targetStatus =
    req.deliveryResult === 'SUCCESS'
      ? 'Delivered'
      : 'Failed';

  const shipmentStateUpdate =
    updateShipmentStatus(
      {
        shipmentId: shipment.id,
        newStatus: targetStatus,
        actor: req.actor,
        note: req.notes
      },
      {
        shipments,
        statusEvents
      }
    );

    let routeStopsResult = routeStops;

  if (req.routeStopId && req.deliveryResult === 'SUCCESS') {
    const rsResult = updateRouteStopStatus(
      { routeStopId: req.routeStopId, newStatus: 'Completed', actor: req.actor },
      { routeStops }
    );
    routeStopsResult = rsResult.routeStops;
  }

  return {
    pods: [newPOD, ...pods],
    shipments: shipmentStateUpdate.shipments,
    statusEvents:
      shipmentStateUpdate.statusEvents,
    routeStops: routeStopsResult
  };
};
