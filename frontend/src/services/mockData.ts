import {
  Organization, User, Driver, Vehicle, DriverVehicleAssignment, Shipment, ShipmentPackage, Address, Route, RouteStop, 
  ShipmentException, ProofOfDelivery, ShipmentStatusEvent, TrackingEvent, MediaFile
} from '../types/domain';

const TWO_HOURS_AGO = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const THIRTY_MINS_AGO = new Date(Date.now() - 30 * 60 * 1000).toISOString();
const FIFTEEN_MINS_AGO = new Date(Date.now() - 15 * 60 * 1000).toISOString();
const FIVE_MINS_AGO = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const TOMORROW_10AM = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // roughly

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'CUST-001', name: 'Acme Corp', createdAt: ONE_DAY_AGO },
  { id: 'CUST-002', name: 'Nova Electronics', createdAt: ONE_DAY_AGO },
  { id: 'CUST-003', name: 'MediSupply', createdAt: ONE_DAY_AGO },
  { id: 'CUST-004', name: 'Fresh Farms', createdAt: ONE_DAY_AGO },
  { id: 'CUST-005', name: 'Heavy Machinery Co', createdAt: ONE_DAY_AGO }
];

export const MOCK_USERS: User[] = [
  { id: 'USR-001', name: 'Admin User', email: 'admin@shiptrack.com', role: 'Administrator' },
  { id: 'USR-002', name: 'Rahul Sharma', email: 'driver1@shiptrack.com', role: 'Driver' },
  { id: 'USR-003', name: 'Amit Singh', email: 'driver2@shiptrack.com', role: 'Driver' },
  { id: 'USR-004', name: 'Nova Electronics', email: 'customer1@nova.com', role: 'Customer', organizationId: 'CUST-002' },
  { id: 'USR-005', name: 'Acme Retail', email: 'business1@acme.com', role: 'BusinessClient', organizationId: 'CUST-001' }
];

export const MOCK_ADDRESSES: Address[] = [
  { id: 'ADDR-1', line1: 'Mumbai DC', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { id: 'ADDR-2', line1: 'Pune Business Park', city: 'Pune', state: 'MH', postalCode: '411001', country: 'India', latitude: 18.5204, longitude: 73.8567 },
  { id: 'ADDR-3', line1: 'Delhi Hub', city: 'New Delhi', state: 'DL', postalCode: '110001', country: 'India' },
  { id: 'ADDR-4', line1: 'Gurgaon Tech Park', city: 'Gurgaon', state: 'HR', postalCode: '122018', country: 'India' },
  { id: 'ADDR-5', line1: 'Bangalore Center', city: 'Bangalore', state: 'KA', postalCode: '560001', country: 'India' },
  { id: 'ADDR-6', line1: 'Chennai Hub', city: 'Chennai', state: 'TN', postalCode: '600001', country: 'India' },
  { id: 'ADDR-7', line1: 'Hyderabad', city: 'Hyderabad', state: 'TS', postalCode: '500001', country: 'India' },
  { id: 'ADDR-8', line1: 'Surat', city: 'Surat', state: 'GJ', postalCode: '395003', country: 'India' },
  { id: 'ADDR-9', line1: 'Kolkata Port', city: 'Kolkata', state: 'WB', postalCode: '700001', country: 'India' },
  { id: 'ADDR-10', line1: 'Bhubaneswar', city: 'Bhubaneswar', state: 'OD', postalCode: '751001', country: 'India' },
  { id: 'ADDR-11', line1: 'Pune Hub', city: 'Pune', state: 'MH', postalCode: '411002', country: 'India' },
  { id: 'ADDR-12', line1: 'Mumbai South', city: 'Mumbai', state: 'MH', postalCode: '400002', country: 'India' },
  { id: 'ADDR-13', line1: 'Noida', city: 'Noida', state: 'UP', postalCode: '201301', country: 'India' }
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'VEH-001', registrationNumber: 'MH-12-AB-4821', type: 'Van', capacityKg: 1000, status: 'Active' },
  { id: 'VEH-002', registrationNumber: 'MH-14-XY-9922', type: 'Heavy Truck', capacityKg: 2000, status: 'Active' },
  { id: 'VEH-003', registrationNumber: 'MH-12-CD-1122', type: 'Van', capacityKg: 500, status: 'Active' },
  { id: 'VEH-004', registrationNumber: 'MH-12-XY-9876', type: 'Bike', capacityKg: 50, status: 'Active' }
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 'DRV-001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'driver1@shiptrack.com', status: 'Active', userId: 'USR-002' },
  { id: 'DRV-002', name: 'Amit Singh', phone: '+91 98765 11111', email: 'driver2@shiptrack.com', status: 'On Leave', userId: 'USR-003' },
  { id: 'DRV-003', name: 'Vijay Singh', phone: '+91 98765 22222', email: 'driver3@shiptrack.com', status: 'Active' },
  { id: 'DRV-004', name: 'Suresh Kumar', phone: '+91 98765 33333', email: 'driver4@shiptrack.com', status: 'Active' },
  { id: 'DRV-005', name: 'Unassigned Driver', phone: '+91 98765 00000', email: 'driver5@shiptrack.com', status: 'Active' }
];

export const MOCK_DRIVER_VEHICLE_ASSIGNMENTS: DriverVehicleAssignment[] = [
  { id: 'DVA-1', driverId: 'DRV-001', vehicleId: 'VEH-001', assignedAt: ONE_DAY_AGO },
  { id: 'DVA-2', driverId: 'DRV-002', vehicleId: 'VEH-002', assignedAt: ONE_DAY_AGO },
  { id: 'DVA-3', driverId: 'DRV-003', vehicleId: 'VEH-003', assignedAt: ONE_DAY_AGO },
  { id: 'DVA-4', driverId: 'DRV-004', vehicleId: 'VEH-004', assignedAt: ONE_DAY_AGO }
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-1', trackingNumber: 'STP-2026-10481', organizationId: 'CUST-001', serviceType: 'Standard', priority: 'High',
    originAddressId: 'ADDR-1', destinationAddressId: 'ADDR-2', driverId: 'DRV-001', routeId: 'RT102', status: 'In Transit',
    createdAt: ONE_DAY_AGO, updatedAt: FIFTEEN_MINS_AGO, deliveryInstructions: 'Deliver to rear loading dock'
  },
  {
    id: 'SHP-2', trackingNumber: 'STP-2026-10482', organizationId: 'CUST-002', serviceType: 'Standard', priority: 'Standard',
    originAddressId: 'ADDR-3', destinationAddressId: 'ADDR-4', driverId: 'DRV-004', routeId: 'RT104', status: 'Delivered',
    createdAt: ONE_DAY_AGO, updatedAt: TWO_HOURS_AGO
  },
  {
    id: 'SHP-3', trackingNumber: 'STP-2026-10483', organizationId: 'CUST-003', serviceType: 'Standard', priority: 'Urgent',
    originAddressId: 'ADDR-5', destinationAddressId: 'ADDR-6', driverId: 'DRV-001', routeId: 'RT102', status: 'In Transit',
    createdAt: ONE_DAY_AGO, updatedAt: FIVE_MINS_AGO
  },
  {
    id: 'SHP-4', trackingNumber: 'STP-2026-10484', organizationId: 'CUST-004', serviceType: 'Standard', priority: 'Urgent',
    originAddressId: 'ADDR-7', destinationAddressId: 'ADDR-2', driverId: null, routeId: null, status: 'Ready for Planning',
    createdAt: ONE_DAY_AGO, updatedAt: ONE_HOUR_AGO
  },
  {
    id: 'SHP-5', trackingNumber: 'STP-2026-10485', organizationId: 'CUST-001', serviceType: 'Standard', priority: 'Standard',
    originAddressId: 'ADDR-1', destinationAddressId: 'ADDR-8', driverId: null, routeId: null, status: 'Ready for Planning',
    createdAt: ONE_DAY_AGO, updatedAt: TWO_HOURS_AGO
  },
  {
    id: 'SHP-6', trackingNumber: 'STP-2026-10486', organizationId: 'CUST-005', serviceType: 'Standard', priority: 'High',
    originAddressId: 'ADDR-9', destinationAddressId: 'ADDR-10', driverId: 'DRV-003', routeId: 'RT105', status: 'Assigned',
    createdAt: ONE_DAY_AGO, updatedAt: THIRTY_MINS_AGO, scheduledDelivery: TOMORROW_10AM
  },
  {
    id: 'SHP-7', trackingNumber: 'STP-2026-10487', organizationId: 'CUST-002', serviceType: 'Standard', priority: 'Standard',
    originAddressId: 'ADDR-11', destinationAddressId: 'ADDR-12', driverId: 'DRV-004', routeId: 'RT101', status: 'Out for Delivery',
    createdAt: ONE_DAY_AGO, updatedAt: FIFTEEN_MINS_AGO
  },
  {
    id: 'SHP-8', trackingNumber: 'STP-2026-10488', organizationId: 'CUST-001', serviceType: 'Standard', priority: 'Standard',
    originAddressId: 'ADDR-3', destinationAddressId: 'ADDR-13', driverId: null, routeId: null, status: 'Draft',
    createdAt: ONE_DAY_AGO, updatedAt: ONE_DAY_AGO
  },
  {
    id: 'SHP-9', trackingNumber: 'STP-2026-10489', organizationId: 'CUST-002', serviceType: 'Express', priority: 'High',
    originAddressId: 'ADDR-2', destinationAddressId: 'ADDR-5', driverId: 'DRV-001', routeId: 'RT102', status: 'Assigned',
    createdAt: ONE_DAY_AGO, updatedAt: ONE_HOUR_AGO, deliveryInstructions: 'Call before delivery'
  },
  {
    id: 'SHP-10', trackingNumber: 'STP-2026-10490', organizationId: 'CUST-003', serviceType: 'Standard', priority: 'Standard',
    originAddressId: 'ADDR-1', destinationAddressId: 'ADDR-6', driverId: 'DRV-001', routeId: 'RT102', status: 'Out for Delivery',
    createdAt: ONE_DAY_AGO, updatedAt: FIFTEEN_MINS_AGO
  }
];

export const MOCK_PACKAGES: ShipmentPackage[] = [
  { id: 'PKG-1', shipmentId: 'SHP-1', description: 'Electronics & Retail Goods', quantity: 1, weight: 450, packageType: 'Pallet', fragile: true },
  { id: 'PKG-2', shipmentId: 'SHP-2', description: 'Consumer Electronics', quantity: 1, weight: 120, packageType: 'Box', fragile: true },
  { id: 'PKG-3', shipmentId: 'SHP-3', description: 'Medical Supplies', quantity: 1, weight: 300, packageType: 'Box', fragile: false },
  { id: 'PKG-4', shipmentId: 'SHP-4', description: 'Fresh Produce', quantity: 1, weight: 200, packageType: 'Crate', fragile: false },
  { id: 'PKG-5', shipmentId: 'SHP-5', description: 'Apparel Bulk', quantity: 1, weight: 850, packageType: 'Pallet', fragile: false },
  { id: 'PKG-6', shipmentId: 'SHP-6', description: 'Machinery Parts', quantity: 1, weight: 600, packageType: 'Crate', fragile: false },
  { id: 'PKG-7', shipmentId: 'SHP-7', description: 'Smartphones', quantity: 1, weight: 50, packageType: 'Box', fragile: true },
  { id: 'PKG-8', shipmentId: 'SHP-8', description: 'Office Supplies', quantity: 1, weight: 10, packageType: 'Box', fragile: false },
  { id: 'PKG-9', shipmentId: 'SHP-9', description: 'Tech Gadgets', quantity: 2, weight: 10, packageType: 'Box', fragile: true },
  { id: 'PKG-10', shipmentId: 'SHP-10', description: 'Home Appliances', quantity: 1, weight: 15, packageType: 'Box', fragile: false }
];

export const MOCK_STATUS_EVENTS: ShipmentStatusEvent[] = [
  { id: 'h3', shipmentId: 'SHP-1', previousStatus: 'Draft', newStatus: 'Assigned', actorUserId: 'USR-001', actorType: 'USER', timestamp: TWO_HOURS_AGO },
  { id: 'h2', shipmentId: 'SHP-1', previousStatus: 'Assigned', newStatus: 'Picked Up', actorUserId: 'USR-002', actorType: 'USER', timestamp: ONE_HOUR_AGO, location: 'Mumbai DC' },
  { id: 'h1', shipmentId: 'SHP-1', previousStatus: 'Picked Up', newStatus: 'In Transit', actorUserId: 'USR-002', actorType: 'USER', timestamp: FIFTEEN_MINS_AGO, location: 'Highway 4' },
  { id: 'h4', shipmentId: 'SHP-2', previousStatus: 'Out for Delivery', newStatus: 'Delivered', actorUserId: 'USR-004', actorType: 'USER', timestamp: TWO_HOURS_AGO, location: 'Gurgaon Tech Park' },
  { id: 'h5', shipmentId: 'SHP-3', previousStatus: 'Picked Up', newStatus: 'In Transit', actorUserId: 'USR-002', actorType: 'USER', timestamp: FIVE_MINS_AGO, location: 'Highway 4' },
  { id: 'h6', shipmentId: 'SHP-4', previousStatus: 'Draft', newStatus: 'Ready for Planning', actorUserId: null, actorType: 'SYSTEM', timestamp: ONE_HOUR_AGO },
  { id: 'h7', shipmentId: 'SHP-5', previousStatus: 'Draft', newStatus: 'Ready for Planning', actorUserId: null, actorType: 'SYSTEM', timestamp: TWO_HOURS_AGO },
  { id: 'h8', shipmentId: 'SHP-6', previousStatus: 'Ready for Planning', newStatus: 'Assigned', actorUserId: 'USR-001', actorType: 'USER', timestamp: THIRTY_MINS_AGO },
  { id: 'h9', shipmentId: 'SHP-7', previousStatus: 'In Transit', newStatus: 'Out for Delivery', actorUserId: 'USR-004', actorType: 'USER', timestamp: FIFTEEN_MINS_AGO, location: 'Mumbai South' },
  { id: 'h10', shipmentId: 'SHP-8', previousStatus: null, newStatus: 'Draft', actorUserId: 'USR-005', actorType: 'USER', timestamp: ONE_DAY_AGO },
  { id: 'h11', shipmentId: 'SHP-9', previousStatus: 'Draft', newStatus: 'Assigned', actorUserId: 'USR-001', actorType: 'USER', timestamp: ONE_HOUR_AGO },
  { id: 'h12', shipmentId: 'SHP-10', previousStatus: 'In Transit', newStatus: 'Out for Delivery', actorUserId: 'USR-002', actorType: 'USER', timestamp: FIFTEEN_MINS_AGO, location: 'Mumbai Suburbs' }
];

export const MOCK_ROUTES: Route[] = [
  { id: 'RT102', name: 'Mumbai - Pune Express', driverId: 'DRV-001', vehicleId: 'VEH-001', status: 'In Progress', distance: 150, duration: 180 },
  { id: 'RT101', name: 'Pune Local Delivery', driverId: 'DRV-004', vehicleId: 'VEH-004', status: 'In Progress', distance: 40, duration: 90 }
];

export const MOCK_ROUTE_STOPS: RouteStop[] = [
  { id: 'STP-1', routeId: 'RT102', shipmentId: 'SHP-1', addressId: 'ADDR-2', sequence: 1, status: 'Pending' },
  { id: 'STP-2', routeId: 'RT102', shipmentId: 'SHP-3', addressId: 'ADDR-6', sequence: 2, status: 'Pending' },
  { id: 'STP-3', routeId: 'RT101', shipmentId: 'SHP-7', addressId: 'ADDR-12', sequence: 1, status: 'Pending' },
  { id: 'STP-4', routeId: 'RT102', shipmentId: 'SHP-9', addressId: 'ADDR-5', sequence: 3, status: 'Pending' },
  { id: 'STP-5', routeId: 'RT102', shipmentId: 'SHP-10', addressId: 'ADDR-6', sequence: 4, status: 'Pending' }
];

export const MOCK_EXCEPTIONS: ShipmentException[] = [
  { id: 'EXC-1', shipmentId: 'SHP-3', type: 'VEHICLE_BREAKDOWN', severity: 'HIGH', description: 'Vehicle tire puncture on Highway 4', status: 'OPEN', createdAt: FIVE_MINS_AGO, createdByType: 'SYSTEM', createdByUserId: null }
];

export const MOCK_PODS: ProofOfDelivery[] = [
  { id: 'POD-1', shipmentId: 'SHP-2', driverId: 'DRV-004', recipientName: 'Front Desk', notes: 'Left at reception', deliveredAt: TWO_HOURS_AGO, deliveryResult: 'SUCCESS', actorType: 'USER', actorUserId: 'DRV-004' }
];

export const MOCK_TRACKING_EVENTS: TrackingEvent[] = [];
export const MOCK_MEDIA_FILES: MediaFile[] = [];

export const generateMockTelemetry = () => {
  return {
    speed: Math.floor(Math.random() * (60 - 30) + 30) + ' km/h',
    heading: Math.floor(Math.random() * 360) + '°'
  };
};
