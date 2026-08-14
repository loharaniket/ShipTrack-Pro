import { ShipmentException } from '../types/domain';
import { CreateExceptionRequest, ResolveExceptionRequest } from '../types/api';

export const createException = (
  req: CreateExceptionRequest,
  state: { exceptions: ShipmentException[] }
) => {
  const { exceptions } = state;
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

  return { exceptions: [newException, ...exceptions] };
};

export const resolveException = (
  req: ResolveExceptionRequest,
  state: { exceptions: ShipmentException[] }
) => {
  const { exceptions } = state;
  const idx = exceptions.findIndex(e => e.id === req.exceptionId);
  if (idx === -1) throw new Error('Exception not found');

  const exception = exceptions[idx];
  const updatedException: ShipmentException = {
    ...exception,
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
    resolvedByType: req.actor.type,
    resolvedByUserId: req.actor.userId,
    notes: req.notes || exception.notes
  };

  const newExceptions = [...exceptions];
  newExceptions[idx] = updatedException;

  return { exceptions: newExceptions };
};
