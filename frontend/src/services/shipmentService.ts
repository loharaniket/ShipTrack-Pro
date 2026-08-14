import {
  Shipment,
  ShipmentStatusEvent,
  ShipmentPackage,
  Address,
  Organization
} from '../types/domain';

import {
  UpdateShipmentStatusRequest,
  CreateShipmentRequest
} from '../types/api';

import { canTransitionShipmentStatus } from '../utils/statusTransitions';

interface ShipmentServiceState {
  shipments: Shipment[];
  packages: ShipmentPackage[];
  statusEvents?: ShipmentStatusEvent[];
  addresses?: Address[];
  organizations?: Organization[];
}

export const createShipment = (
  req: CreateShipmentRequest,
  state: ShipmentServiceState
) => {
  const {
    shipments,
    packages,
    addresses = [],
    organizations = []
  } = state;

  if (!organizations.some(org => org.id === req.organizationId)) {
    throw new Error(`Organization not found: ${req.organizationId}`);
  }

  if (!addresses.some(address => address.id === req.originAddressId)) {
    throw new Error(`Origin address not found: ${req.originAddressId}`);
  }

  if (!addresses.some(address => address.id === req.destinationAddressId)) {
    throw new Error(
      `Destination address not found: ${req.destinationAddressId}`
    );
  }

  if (req.packages.length === 0) {
    throw new Error('At least one package is required');
  }

  if (
    shipments.some(
      shipment => shipment.trackingNumber === req.trackingNumber
    )
  ) {
    throw new Error(
      `Tracking number already exists: ${req.trackingNumber}`
    );
  }

  const shipmentId = `SHP-${Date.now()}`;
  const now = new Date().toISOString();

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
    createdAt: now,
    updatedAt: now
  };

  const newPackages: ShipmentPackage[] = req.packages.map(
    (pkg, index) => ({
      id: `PKG-${Date.now()}-${index}`,
      shipmentId,
      description: pkg.description,
      quantity: pkg.quantity,
      weight: pkg.weight,
      length: pkg.length,
      width: pkg.width,
      height: pkg.height,
      packageType: pkg.packageType,
      fragile: pkg.fragile,
      declaredValue: pkg.declaredValue,
      specialHandling: pkg.specialHandling
    })
  );

  return {
    shipments: [newShipment, ...shipments],
    packages: [...newPackages, ...packages]
  };
};

export const updateShipmentStatus = (
  req: UpdateShipmentStatusRequest,
  state: {
    shipments: Shipment[];
    statusEvents: ShipmentStatusEvent[];
  }
): {
  shipments: Shipment[];
  statusEvents: ShipmentStatusEvent[];
} => {
  const { shipments, statusEvents } = state;

  const idx = shipments.findIndex(
    shipment =>
      shipment.id === req.shipmentId ||
      shipment.trackingNumber === req.shipmentId
  );

  if (idx === -1) {
    throw new Error(`Shipment not found: ${req.shipmentId}`);
  }

  const shipment = shipments[idx];

  if (
    !canTransitionShipmentStatus(
      shipment.status,
      req.newStatus
    )
  ) {
    throw new Error(
      `Invalid shipment status transition: ${shipment.status} -> ${req.newStatus}`
    );
  }

  const now = new Date().toISOString();

  const event: ShipmentStatusEvent = {
    id: `SE-${Date.now()}`,
    shipmentId: shipment.id,
    previousStatus: shipment.status,
    newStatus: req.newStatus,
    actorType: req.actor.type,
    actorUserId: req.actor.userId,
    timestamp: now,
    location: req.location,
    note: req.note
  };

  const updatedShipment: Shipment = {
    ...shipment,
    status: req.newStatus,
    updatedAt: now
  };

  const newShipments = [...shipments];
  newShipments[idx] = updatedShipment;

  return {
    shipments: newShipments,
    statusEvents: [event, ...statusEvents]
  };
};
