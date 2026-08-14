import {
  ShipmentException,
  Shipment,
  Route
} from '../types/domain';

import {
  CreateExceptionRequest,
  ResolveExceptionRequest
} from '../types/api';

interface ExceptionServiceState {
  exceptions: ShipmentException[];
  shipments?: Shipment[];
  routes?: Route[];
}

export const createException = (
  req: CreateExceptionRequest,
  state: ExceptionServiceState
) => {
  const {
    exceptions,
    shipments = [],
    routes = []
  } = state;

  if (
    shipments.length > 0 &&
    !shipments.some(
      shipment => shipment.id === req.shipmentId
    )
  ) {
    throw new Error(
      `Shipment not found: ${req.shipmentId}`
    );
  }

  if (
    req.routeId &&
    routes.length > 0 &&
    !routes.some(route => route.id === req.routeId)
  ) {
    throw new Error(
      `Route not found: ${req.routeId}`
    );
  }

  if (req.routeId && shipments.length > 0 && routes.length > 0) {
    const shipment = shipments.find(
      item => item.id === req.shipmentId
    );

    if (
      shipment &&
      shipment.routeId &&
      shipment.routeId !== req.routeId
    ) {
      throw new Error(
        `Shipment ${req.shipmentId} does not belong to route ${req.routeId}`
      );
    }
  }

  const newException: ShipmentException = {
    id: `EXC-${Date.now()}`,
    shipmentId: req.shipmentId,
    routeId: req.routeId,
    type: req.type,
    severity: req.severity,
    description: req.description,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    createdByType: req.actor.type,
    createdByUserId: req.actor.userId
  };

  return {
    exceptions: [
      newException,
      ...exceptions
    ]
  };
};

export const resolveException = (
  req: ResolveExceptionRequest,
  state: {
    exceptions: ShipmentException[];
  }
) => {
  const { exceptions } = state;

  const index = exceptions.findIndex(
    exception => exception.id === req.exceptionId
  );

  if (index === -1) {
    throw new Error(
      `Exception not found: ${req.exceptionId}`
    );
  }

  const exception = exceptions[index];

  if (exception.status === 'RESOLVED') {
    throw new Error(
      `Exception ${req.exceptionId} is already resolved`
    );
  }

  const updatedException: ShipmentException = {
    ...exception,
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
    resolvedByType: req.actor.type,
    resolvedByUserId: req.actor.userId,
    notes: req.notes ?? exception.notes
  };

  const newExceptions = [...exceptions];

  newExceptions[index] = updatedException;

  return {
    exceptions: newExceptions
  };
};
