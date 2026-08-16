import {
  Priority,
  ShipmentStatus,
  RouteStatus,
  RouteStopStatus,
  ShipmentExceptionType,
  ExceptionSeverity,
  DeliveryResult
} from './domain';

export type ActorDTO =
  | {
      type: 'USER';
      userId: string;
    }
  | {
      type: 'SYSTEM';
      userId: null;
    };

export interface CreateShipmentPackageRequest {
  description: string;
  quantity: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  packageType: string;
  fragile: boolean;
  declaredValue?: number;
  specialHandling?: string;
}

export interface CreateShipmentRequest {
  trackingNumber: string;
  organizationId: string;
  serviceType: string;
  priority: Priority;
  originAddressId: string;
  destinationAddressId: string;
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  pickupAddress?: string;
  deliveryInstructions?: string;
  scheduledPickup?: string;
  scheduledDelivery?: string;
  packages: CreateShipmentPackageRequest[];
}

export interface UpdateShipmentRequest {
  priority?: Priority;
  deliveryInstructions?: string;
  scheduledPickup?: string;
  scheduledDelivery?: string;
}

export interface UpdateShipmentStatusRequest {
  shipmentId: string;
  newStatus: ShipmentStatus;
  actor: ActorDTO;
  location?: string;
  note?: string;
}

export interface CreateAddressRequest {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  deliveryInstructions?: string;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface CreateRouteRequest {
  name: string;
  plannedStart?: string;
  plannedEnd?: string;
  shipmentIds: string[];
}

export interface AssignDriverRequest {
  routeId: string;
  driverId: string;
  actor: ActorDTO;
}

export interface UpdateRouteStatusRequest {
  routeId: string;
  newStatus: RouteStatus;
  actor: ActorDTO;
}

export interface UpdateRouteStopStatusRequest {
  routeStopId: string;
  newStatus: RouteStopStatus;
  actor: ActorDTO;
  actualArrival?: string;
  actualDeparture?: string;
}

export interface DispatchRouteRequest {
  routeId: string;
  actor: ActorDTO;
}

export interface CreateExceptionRequest {
  shipmentId: string;
  routeId?: string;
  type: ShipmentExceptionType;
  severity: ExceptionSeverity;
  description: string;
  actor: ActorDTO;
}

export interface ResolveExceptionRequest {
  exceptionId: string;
  actor: ActorDTO;
  notes?: string;
}

export interface SubmitPODRequest {
  shipmentId: string;
  routeStopId?: string;
  driverId: string;
  recipientName: string;
  signatureMediaId?: string;
  photoMediaIds?: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  deliveryResult: DeliveryResult;
  actor: ActorDTO;
}

export interface CreateDriverRequest {
  userId?: string;
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface UpdateDriverRequest extends Partial<CreateDriverRequest> {}

export interface CreateVehicleRequest {
  registrationNumber: string;
  type: string;
  capacityKg: number;
  status: 'Active' | 'Maintenance' | 'Retired';
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {}

export interface TrackingEventResponse {
  id: string;
  shipmentId?: string;
  routeId?: string;
  driverId?: string;
  vehicleId?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
  source: 'GPS_DEVICE' | 'DRIVER_APP' | 'SYSTEM';
}
