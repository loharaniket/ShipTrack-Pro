import { ProofOfDelivery, Shipment, ShipmentStatusEvent } from '../types/domain';
import { SubmitPODRequest } from '../types/api';
import { updateShipmentStatus } from './shipmentService';

export const submitPOD = (
  req: SubmitPODRequest,
  state: { pods: ProofOfDelivery[]; shipments: Shipment[]; statusEvents: ShipmentStatusEvent[] }
) => {
  const { pods, shipments, statusEvents } = state;
  
  const newPOD: ProofOfDelivery = {
    id: `POD-${Date.now()}`,
    shipmentId: req.shipmentId,
    routeStopId: req.routeStopId,
    driverId: req.driverId,
    recipientName: req.recipientName,
    deliveredAt: new Date().toISOString(), // explicitly ensure ISO 8601 here
    signatureMediaId: req.signatureMediaId,
    photoMediaIds: req.photoMediaIds,
    notes: req.notes,
    latitude: req.latitude,
    longitude: req.longitude,
    deliveryResult: req.deliveryResult,
    actorType: req.actor.type,
    actorUserId: req.actor.userId
  };

  // Determine new shipment status based on delivery result
  const targetStatus = req.deliveryResult === 'SUCCESS' ? 'Delivered' : 'Failed';

  // Use the shipment service to correctly update shipment status and validate transitions
  const shipmentStateUpdate = updateShipmentStatus(
    {
      shipmentId: req.shipmentId,
      newStatus: targetStatus,
      actor: req.actor,
      note: req.notes
    },
    { shipments, statusEvents }
  );

  return {
    pods: [newPOD, ...pods],
    shipments: shipmentStateUpdate.shipments,
    statusEvents: shipmentStateUpdate.statusEvents
  };
};
