export type Role = 'Administrator' | 'Driver' | 'Customer' | 'BusinessClient';

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

export interface Organization {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string; // Optional for Admins, required for Customers/BusinessClients
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
  userId?: string; // Links driver to user account
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  vehicleId?: string; // Explicit assignment relation
}

export interface DriverVehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string; // ISO 8601
  unassignedAt?: string; // ISO 8601
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
  trackingNumber: string; // Customer-facing ID
  organizationId: string;
  serviceType: string;
  priority: Priority;
  originAddressId: string;
  destinationAddressId: string;
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  driverId: string | null;
  routeId: string | null;
  status: ShipmentStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  scheduledPickup?: string; // ISO 8601
  scheduledDelivery?: string; // ISO 8601
  deliveryInstructions?: string;
}

// UI/View Model type extending Shipment with derived values for the frontend demo
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
  actorUserId: string | null; // Nullable for SYSTEM
  actorType: 'USER' | 'SYSTEM';
  timestamp: string; // ISO 8601
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
  timestamp: string; // ISO 8601
  source: 'GPS_DEVICE' | 'DRIVER_APP' | 'SYSTEM';
}

export interface ShipmentException {
  id: string;
  shipmentId: string;
  routeId?: string;
  type: 'VEHICLE_BREAKDOWN' | 'WEATHER_DELAY' | 'CUSTOMER_UNAVAILABLE' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string; // ISO 8601
  createdBy: string; // User ID
  resolvedAt?: string | null; // ISO 8601
  resolvedBy?: string | null; // User ID
  notes?: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'IMAGE' | 'SIGNATURE' | 'DOCUMENT';
  sizeBytes?: number;
  uploadedAt: string; // ISO 8601
}

export interface ProofOfDelivery {
  id: string;
  shipmentId: string;
  routeStopId?: string;
  driverId: string;
  recipientName: string;
  deliveredAt: string; // ISO 8601
  signatureMediaId?: string;
  photoMediaIds?: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  deliveryResult: 'SUCCESS' | 'FAILED_REJECTED' | 'FAILED_NOT_FOUND';
}

export interface Route {
  id: string;
  name: string;
  driverId: string | null;
  vehicleId: string | null;
  status: RouteStatus;
  plannedStart?: string; // ISO 8601
  plannedEnd?: string; // ISO 8601
  actualStart?: string; // ISO 8601
  actualEnd?: string; // ISO 8601
  distance: number; // km
  duration: number; // mins
}

export interface RouteStop {
  id: string;
  routeId: string;
  shipmentId: string;
  addressId?: string;
  sequence: number;
  status: RouteStopStatus;
  plannedArrival?: string; // ISO 8601
  actualArrival?: string; // ISO 8601
  actualDeparture?: string; // ISO 8601
  serviceDuration?: number; // mins
}

export interface OptimizationResult {
  id: string;
  routeId: string;
  originalStopSequence: string[]; // array of RouteStop IDs
  optimizedStopSequence: string[]; // array of RouteStop IDs
  previousDistance: number;
  optimizedDistance: number;
  previousDuration: number;
  optimizedDuration: number;
  generatedAt: string; // ISO 8601
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
  timestamp: string; // ISO 8601
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO 8601
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string; // ISO 8601
  details?: string;
}
