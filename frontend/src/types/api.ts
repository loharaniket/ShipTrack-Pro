import { 
  Priority, 
  ShipmentStatus, 
  RouteStatus, 
  RouteStopStatus, 
  ShipmentPackage 
} from './domain';

// --- Shared Actor Interface ---
export interface ActorDTO {
  type: 'USER' | 'SYSTEM';
  userId: string | null;
}

// --- Shipment Operations ---
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
  deliveryInstructions?: string;
  scheduledPickup?: string;
  scheduledDelivery?: string;
  packages: Omit<ShipmentPackage, 'id' | 'shipmentId'>[];
}

export interface UpdateShipmentRequest {
  shipmentId: string;
  priority?: Priority;
  deliveryInstructions?: string;
}

export interface UpdateShipmentStatusRequest {
  shipmentId: string;
  newStatus: ShipmentStatus;
  actor: ActorDTO;
  location?: string;
  note?: string;
}

// --- Route Operations ---
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

// --- Exception Operations ---
export interface CreateExceptionRequest {
  shipmentId: string;
  routeId?: string;
  type: 'VEHICLE_BREAKDOWN' | 'WEATHER_DELAY' | 'CUSTOMER_UNAVAILABLE' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  actor: ActorDTO;
}

export interface ResolveExceptionRequest {
  exceptionId: string;
  actor: ActorDTO;
  notes?: string;
}

// --- Proof of Delivery Operations ---
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
  deliveryResult: 'SUCCESS' | 'FAILED_REJECTED' | 'FAILED_NOT_FOUND';
  actor: ActorDTO;
}

// --- Tracking Operations ---
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
  timestamp: string;
}
