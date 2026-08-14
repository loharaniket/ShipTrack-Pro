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

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string; // Used for Customers or BusinessClients
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  vehicle?: {
    registrationNumber: string;
    type: string;
    capacityKg: number;
  };
  userId?: string; // Links driver to user account
}

export interface ShipmentHistoryEvent {
  id: string;
  shipmentId: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  actorUserId: string; // User ID
  timestamp: string; // ISO 8601
  location?: string;
  note?: string;
}

export interface ShipmentException {
  id: string;
  shipmentId: string;
  type: 'VEHICLE_BREAKDOWN' | 'WEATHER_DELAY' | 'CUSTOMER_UNAVAILABLE' | 'OTHER';
  description: string;
  createdAt: string; // ISO 8601
  createdBy: string; // User ID
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolution?: string;
}

export interface ProofOfDelivery {
  id: string;
  shipmentId: string;
  driverId: string;
  recipientName: string;
  signatureUrl?: string; // Optional if collected
  deliveryNotes?: string;
  timestamp: string; // ISO 8601
}

export interface Shipment {
  id: string;
  trackingNumber: string; // Usually external facing ID like "STP-..."
  organizationId: string;     // Ref to Organization (Tenant)
  originAddress: string;
  destinationAddress: string;
  status: ShipmentStatus;
  priority: Priority;
  driverId: string | null;
  routeId: string | null;
  weightKg: number;
  description: string;
  isFragile: boolean;
  deliveryInstructions?: string;
  eta: string;
  progressPercentage: number;
  statusHistory: ShipmentHistoryEvent[];
}

export interface RouteStop {
  id: string;
  routeId: string;
  shipmentId: string;
  sequence: number;
  status: RouteStopStatus;
  eta: string;
}

export interface Route {
  id: string;
  name: string;
  driverId: string | null;
  status: RouteStatus;
  origin: string;
  destination: string;
  estimatedDistanceKm: number;
  estimatedDurationMins: number;
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
