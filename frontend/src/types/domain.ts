export type Role =
  | 'Administrator'
  | 'Driver'
  | 'Customer'
  | 'BusinessClient';

export type Permission =
  | 'VIEW_ALL_SHIPMENTS'
  | 'VIEW_OWN_SHIPMENTS'
  | 'CREATE_SHIPMENT'
  | 'UPDATE_ASSIGNED_SHIPMENT'
  | 'MANAGE_DRIVERS'
  | 'ASSIGN_SHIPMENTS'
  | 'CREATE_ROUTE'
  | 'OPTIMIZE_ROUTE'
  | 'DISPATCH_ROUTE'
  | 'SUBMIT_POD'
  | 'VIEW_REPORTS'
  | 'MANAGE_USERS';

export type ShipmentStatus =
  | 'Draft'
  | 'Ready for Planning'
  | 'Planned'
  | 'Assigned'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed'
  | 'Cancelled';

export type RouteStatus =
  | 'Draft'
  | 'Planned'
  | 'Assigned'
  | 'Dispatched'
  | 'In Progress'
  | 'Completed'
  | 'Exception'
  | 'Cancelled';

export type RouteStopStatus =
  | 'Pending'
  | 'Arrived'
  | 'Completed'
  | 'Skipped'
  | 'Failed';

export type Priority = 'Standard' | 'High' | 'Urgent';

export type ActorType = 'USER' | 'SYSTEM';

export interface Actor {
  type: ActorType;
  userId: string | null;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
}

export interface Address {
  id: string;
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

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  capacityKg: number;
  status: 'Active' | 'Maintenance' | 'Retired';
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface DriverVehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt?: string;
}

export interface ShipmentPackage {
  id: string;
  shipmentId: string;
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

export interface Shipment {
  id: string;
  trackingNumber: string;
  organizationId: string;
  serviceType: string;
  priority: Priority;
  originAddressId: string;
  destinationAddressId: string;
  originAddressLabel?: string;
  destinationAddressLabel?: string;
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  driverId: string | null;
  routeId: string | null;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  scheduledPickup?: string;
  scheduledDelivery?: string;
  deliveryInstructions?: string;
  history?: ShipmentStatusEvent[];
  packages?: ShipmentPackage[];
}

export interface ShipmentView extends Shipment {
  originAddressLabel: string;
  destinationAddressLabel: string;
  eta?: string;
  progressPercentage?: number;
}

export interface ShipmentStatusEvent {
  id: string;
  shipmentId: string;
  previousStatus: ShipmentStatus | null;
  newStatus: ShipmentStatus;
  actorType: ActorType;
  actorUserId: string | null;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  note?: string;
}

export interface TrackingEvent {
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

export type ShipmentExceptionType =
  | 'VEHICLE_BREAKDOWN'
  | 'WEATHER_DELAY'
  | 'CUSTOMER_UNAVAILABLE'
  | 'OTHER';

export type ExceptionSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface ShipmentException {
  id: string;
  shipmentId: string;
  routeId?: string;
  type: ShipmentExceptionType;
  severity: ExceptionSeverity;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  createdByType: ActorType;
  createdByUserId: string | null;
  resolvedAt?: string | null;
  resolvedByType?: ActorType;
  resolvedByUserId?: string | null;
  notes?: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'IMAGE' | 'SIGNATURE' | 'DOCUMENT';
  sizeBytes?: number;
  uploadedAt: string;
}

export type DeliveryResult =
  | 'SUCCESS'
  | 'FAILED_REJECTED'
  | 'FAILED_NOT_FOUND';

export interface ProofOfDelivery {
  id: string;
  shipmentId: string;
  routeStopId?: string;
  driverId: string;
  recipientName: string;
  deliveredAt: string;
  signatureMediaId?: string;
  photoMediaIds?: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  deliveryResult: DeliveryResult;
  actorType: ActorType;
  actorUserId: string | null;
}

export interface Route {
  id: string;
  name: string;
  driverId: string | null;
  vehicleId: string | null;
  status: RouteStatus;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  distance: number;
  duration: number;
}

export interface RouteStop {
  id: string;
  routeId: string;
  shipmentId: string;
  addressId?: string;
  sequence: number;
  status: RouteStopStatus;
  plannedArrival?: string;
  actualArrival?: string;
  actualDeparture?: string;
  serviceDuration?: number;
}

export interface OptimizationResult {
  id: string;
  routeId: string;
  originalStopSequence: string[];
  optimizedStopSequence: string[];
  previousDistance: number;
  optimizedDistance: number;
  previousDuration: number;
  optimizedDuration: number;
  generatedAt: string;
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface GeofenceEvent {
  id: string;
  geofenceId: string;
  driverId?: string;
  vehicleId?: string;
  eventType: 'ENTER' | 'EXIT';
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorType: ActorType;
  actorUserId: string | null;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details?: string;
}
