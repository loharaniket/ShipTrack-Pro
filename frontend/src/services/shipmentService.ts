import { Shipment, ShipmentStatusEvent, ShipmentPackage } from '../types/domain';
import { UpdateShipmentStatusRequest, CreateShipmentRequest } from '../types/api';
import { canTransitionShipmentStatus } from '../utils/statusTransitions';

export const createShipment = (
  req: CreateShipmentRequest,
  state: { shipments: Shipment[]; packages: ShipmentPackage[] }
) => {
  const { shipments, packages } = state;
  const shipmentId = `SHP-${Date.now()}`;
  
  const newShipment: Shipment = {
    id: shipmentId,
    trackingNumber: req.trackingNumber,
    organizationId: req.organizationId,
    serviceType: req.serviceType,
    priority: req.priority,
    originAddressId: req.originAddressId,
    destinationAddressId: req.destinationAddressId,
    senderName: req.senderName,
    senderPhone: req.senderPhone,
    recipientName: req.recipientName,
    recipientPhone: req.recipientPhone,
    deliveryInstructions: req.deliveryInstructions,
    scheduledPickup: req.scheduledPickup,
    scheduledDelivery: req.scheduledDelivery,
    driverId: null,
    routeId: null,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const newPackages: ShipmentPackage[] = req.packages.map((pkg, idx) => ({
    ...pkg,
    id: `PKG-${Date.now()}-${idx}`,
    shipmentId
  }));

  return {
    shipments: [newShipment, ...shipments],
    packages: [...newPackages, ...packages]
  };
};

export const updateShipmentStatus = (
  req: UpdateShipmentStatusRequest,
  state: { shipments: Shipment[]; statusEvents: ShipmentStatusEvent[] }
): { shipments: Shipment[]; statusEvents: ShipmentStatusEvent[] } => {
  const { shipments, statusEvents } = state;
  const idx = shipments.findIndex(s => s.id === req.shipmentId || s.trackingNumber === req.shipmentId);
  if (idx === -1) throw new Error('Shipment not found');

  const shipment = shipments[idx];
  
  if (!canTransitionShipmentStatus(shipment.status, req.newStatus)) {
    throw new Error(`Invalid status transition from ${shipment.status} to ${req.newStatus}`);
  }

  const newEvent: ShipmentStatusEvent = {
    id: Date.now().toString(),
    shipmentId: shipment.id,
    previousStatus: shipment.status,
    newStatus: req.newStatus,
    timestamp: new Date().toISOString(),
    actorUserId: req.actor.userId,
    actorType: req.actor.type,
    location: req.location,
    note: req.note
  };

  const updatedShipment = { 
    ...shipment, 
    status: req.newStatus, 
    updatedAt: new Date().toISOString() 
  };

  const newShipments = [...shipments];
  newShipments[idx] = updatedShipment;

  return {
    shipments: newShipments,
    statusEvents: [newEvent, ...statusEvents]
  };
};
