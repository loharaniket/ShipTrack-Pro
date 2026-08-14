export type Role = 'Administrator' | 'Driver' | 'Customer' | 'BusinessClient';

export type Permission = 
  | 'VIEW_ALL_SHIPMENTS'
  | 'VIEW_OWN_SHIPMENTS'
  | 'CREATE_SHIPMENT'
  | 'UPDATE_ASSIGNED_SHIPMENT'
  | 'MANAGE_DRIVERS'
  | 'MANAGE_VEHICLES'
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
  vehicleId?: string | null;
  userId?: string; // Links driver to user account
}

export interface Vehicle {
  id: string;
  registration: string;
  type: string;
  capacityKg: number;
  status: 'Available' | 'In Use' | 'Maintenance';
}

export interface StatusHistoryEvent {
  id: string;
  status: ShipmentStatus | RouteStatus;
  timestamp: string; // Using ISO string or deterministic mock timestamp
  updatedBy: string; // User ID
  location: string;
  note?: string;
}

export interface ShipmentException {
  id: string;
  shipmentId: string;
  type: 'VEHICLE_BREAKDOWN' | 'WEATHER_DELAY' | 'CUSTOMER_UNAVAILABLE' | 'OTHER';
  description: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface ProofOfDelivery {
  id: string;
  shipmentId: string;
  recipientName: string;
  signatureUrl?: string; // Optional if collected
  deliveryNotes?: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string; // Usually external facing ID like "STP-..."
  customerId: string;     // Ref to Customer
  originAddress: string;
  destinationAddress: string;
  status: ShipmentStatus;
  priority: Priority;
  driverId: string | null;
  vehicleId: string | null;
  routeId: string | null;
  weightKg: number;
  description: string;
  isFragile: boolean;
  deliveryInstructions?: string;
  eta: string;
  progressPercentage: number;
  statusHistory: StatusHistoryEvent[];
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
  vehicleId: string | null;
  status: RouteStatus;
  origin: string;
  destination: string;
  estimatedDistanceKm: number;
  estimatedDurationMins: number;
  stops: string[]; // Array of RouteStop IDs, sequence determined by the RouteStop entity itself or we can store an ordered array
}
