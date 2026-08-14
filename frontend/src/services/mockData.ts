import {
  User, Driver, Vehicle, Shipment, Route, RouteStop, 
  ShipmentException, ProofOfDelivery
} from '../types/domain';

export const MOCK_USERS: User[] = [
  { id: 'USR-001', name: 'Admin User', email: 'admin@shiptrack.com', role: 'Administrator' },
  { id: 'USR-002', name: 'Rahul Sharma', email: 'driver1@shiptrack.com', role: 'Driver' },
  { id: 'USR-003', name: 'Amit Singh', email: 'driver2@shiptrack.com', role: 'Driver' },
  { id: 'USR-004', name: 'Nova Electronics', email: 'customer1@nova.com', role: 'Customer', organizationId: 'CUST-002' },
  { id: 'USR-005', name: 'Acme Retail', email: 'business1@acme.com', role: 'BusinessClient', organizationId: 'CUST-001' }
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'VEH-001', registration: 'MH-12-AB-4821', type: 'Heavy Truck', capacityKg: 1000, status: 'In Use' },
  { id: 'VEH-002', registration: 'MH-14-XY-9922', type: 'Medium Truck', capacityKg: 500, status: 'Available' },
  { id: 'VEH-003', registration: 'MH-01-AB-1234', type: 'Refrigerated', capacityKg: 750, status: 'In Use' },
  { id: 'VEH-004', registration: 'MH-43-XY-5544', type: 'Light Van', capacityKg: 250, status: 'In Use' }
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 'DRV-001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'driver1@shiptrack.com', status: 'Active', vehicleId: 'VEH-001', userId: 'USR-002' },
  { id: 'DRV-002', name: 'Amit Singh', phone: '+91 98765 11111', email: 'driver2@shiptrack.com', status: 'On Leave', vehicleId: 'VEH-002', userId: 'USR-003' },
  { id: 'DRV-003', name: 'Vijay Singh', phone: '+91 98765 22222', email: 'driver3@shiptrack.com', status: 'Active', vehicleId: 'VEH-003' },
  { id: 'DRV-004', name: 'Suresh Kumar', phone: '+91 98765 33333', email: 'driver4@shiptrack.com', status: 'Active', vehicleId: 'VEH-004' },
  { id: 'DRV-005', name: 'Unassigned Driver', phone: '+91 98765 00000', email: 'driver5@shiptrack.com', status: 'Active', vehicleId: null }
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-1',
    trackingNumber: 'STP-2026-10481',
    customerId: 'CUST-001',
    originAddress: 'Mumbai DC',
    destinationAddress: 'Pune Business Park',
    status: 'In Transit',
    priority: 'High',
    driverId: 'DRV-001',
    routeId: 'RT102',
    vehicleId: 'VEH-001',
    weightKg: 450,
    description: 'Electronics & Retail Goods',
    isFragile: true,
    deliveryInstructions: 'Deliver to rear loading dock',
    eta: 'Today, 2:30 PM',
    progressPercentage: 75,
    statusHistory: [
      { id: 'h3', status: 'Assigned', timestamp: '2 hours ago', updatedBy: 'USR-001', location: 'System' },
      { id: 'h2', status: 'Picked Up', timestamp: '1 hour ago', updatedBy: 'USR-002', location: 'Mumbai DC' },
      { id: 'h1', status: 'In Transit', timestamp: '15 mins ago', updatedBy: 'USR-002', location: 'Highway 4' }
    ]
  },
  {
    id: 'SHP-2',
    trackingNumber: 'STP-2026-10482',
    customerId: 'CUST-002',
    originAddress: 'Delhi Hub',
    destinationAddress: 'Gurgaon Tech Park',
    status: 'Delivered',
    priority: 'Standard',
    driverId: 'DRV-004',
    routeId: 'RT104',
    vehicleId: 'VEH-004',
    weightKg: 120,
    description: 'Consumer Electronics',
    isFragile: true,
    eta: '-',
    progressPercentage: 100,
    statusHistory: [
      { id: 'h4', status: 'Delivered', timestamp: '2 hours ago', updatedBy: 'USR-004', location: 'Gurgaon Tech Park' }
    ]
  },
  {
    id: 'SHP-3',
    trackingNumber: 'STP-2026-10483',
    customerId: 'CUST-003',
    originAddress: 'Bangalore Center',
    destinationAddress: 'Chennai Hub',
    status: 'In Transit',
    priority: 'Urgent',
    driverId: 'DRV-001',
    routeId: 'RT102',
    vehicleId: 'VEH-001',
    weightKg: 300,
    description: 'Medical Supplies',
    isFragile: false,
    eta: 'Delayed',
    progressPercentage: 45,
    statusHistory: [
      { id: 'h5', status: 'In Transit', timestamp: '5 mins ago', updatedBy: 'USR-002', location: 'Highway 4' }
    ]
  },
  {
    id: 'SHP-4',
    trackingNumber: 'STP-2026-10484',
    customerId: 'CUST-004',
    originAddress: 'Hyderabad',
    destinationAddress: 'Pune Business Park',
    status: 'Ready for Planning',
    priority: 'Urgent',
    driverId: null,
    routeId: null,
    vehicleId: null,
    weightKg: 200,
    description: 'Fresh Produce',
    isFragile: false,
    eta: '-',
    progressPercentage: 0,
    statusHistory: [
      { id: 'h6', status: 'Ready for Planning', timestamp: '1 hour ago', updatedBy: 'System', location: 'System' }
    ]
  },
  {
    id: 'SHP-5',
    trackingNumber: 'STP-2026-10485',
    customerId: 'CUST-001',
    originAddress: 'Mumbai DC',
    destinationAddress: 'Surat',
    status: 'Ready for Planning',
    priority: 'Standard',
    driverId: null,
    routeId: null,
    vehicleId: null,
    weightKg: 850,
    description: 'Apparel Bulk',
    isFragile: false,
    eta: '-',
    progressPercentage: 0,
    statusHistory: [
      { id: 'h7', status: 'Ready for Planning', timestamp: '2 hours ago', updatedBy: 'System', location: 'System' }
    ]
  },
  {
    id: 'SHP-6',
    trackingNumber: 'STP-2026-10486',
    customerId: 'CUST-005',
    originAddress: 'Kolkata Port',
    destinationAddress: 'Bhubaneswar',
    status: 'Assigned',
    priority: 'High',
    driverId: 'DRV-003',
    routeId: 'RT105',
    vehicleId: 'VEH-003',
    weightKg: 600,
    description: 'Machinery Parts',
    isFragile: false,
    eta: 'Tomorrow, 10:00 AM',
    progressPercentage: 10,
    statusHistory: [
      { id: 'h8', status: 'Assigned', timestamp: '30 mins ago', updatedBy: 'USR-001', location: 'System' }
    ]
  },
  {
    id: 'SHP-7',
    trackingNumber: 'STP-2026-10487',
    customerId: 'CUST-002',
    originAddress: 'Pune Hub',
    destinationAddress: 'Mumbai South',
    status: 'Out for Delivery',
    priority: 'Standard',
    driverId: 'DRV-004',
    routeId: 'RT101',
    vehicleId: 'VEH-004',
    weightKg: 50,
    description: 'Smartphones',
    isFragile: true,
    eta: 'Today, 4:00 PM',
    progressPercentage: 90,
    statusHistory: [
      { id: 'h9', status: 'Out for Delivery', timestamp: '10 mins ago', updatedBy: 'USR-004', location: 'Mumbai South' }
    ]
  },
  {
    id: 'SHP-8',
    trackingNumber: 'STP-2026-10488',
    customerId: 'CUST-001',
    originAddress: 'Delhi Hub',
    destinationAddress: 'Noida',
    status: 'Draft',
    priority: 'Standard',
    driverId: null,
    routeId: null,
    vehicleId: null,
    weightKg: 10,
    description: 'Office Supplies',
    isFragile: false,
    eta: '-',
    progressPercentage: 0,
    statusHistory: [
      { id: 'h10', status: 'Draft', timestamp: '1 day ago', updatedBy: 'USR-005', location: 'System' }
    ]
  }
];

export const MOCK_ROUTES: Route[] = [
  {
    id: 'RT102',
    name: 'Mumbai - Pune Express',
    driverId: 'DRV-001',
    vehicleId: 'VEH-001',
    status: 'In Progress',
    origin: 'Mumbai DC',
    destination: 'Pune',
    estimatedDistanceKm: 150,
    estimatedDurationMins: 180,
    stops: ['STP-1', 'STP-2']
  },
  {
    id: 'RT101',
    name: 'Pune Local Delivery',
    driverId: 'DRV-004',
    vehicleId: 'VEH-004',
    status: 'In Progress',
    origin: 'Pune Hub',
    destination: 'Mumbai South',
    estimatedDistanceKm: 40,
    estimatedDurationMins: 90,
    stops: ['STP-3']
  }
];

export const MOCK_ROUTE_STOPS: RouteStop[] = [
  {
    id: 'STP-1',
    routeId: 'RT102',
    shipmentId: 'SHP-1',
    sequence: 1,
    status: 'Pending',
    eta: 'Today 2:30 PM'
  },
  {
    id: 'STP-2',
    routeId: 'RT102',
    shipmentId: 'SHP-3',
    sequence: 2,
    status: 'Pending',
    eta: 'Today 5:00 PM'
  },
  {
    id: 'STP-3',
    routeId: 'RT101',
    shipmentId: 'SHP-7',
    sequence: 1,
    status: 'Pending',
    eta: 'Today 4:00 PM'
  }
];

export const MOCK_EXCEPTIONS: ShipmentException[] = [
  {
    id: 'EXC-1',
    shipmentId: 'SHP-3',
    type: 'VEHICLE_BREAKDOWN',
    description: 'Vehicle tire puncture on Highway 4',
    createdAt: '5 mins ago'
  }
];

export const MOCK_PODS: ProofOfDelivery[] = [
  {
    id: 'POD-1',
    shipmentId: 'SHP-2',
    recipientName: 'Front Desk',
    deliveryNotes: 'Left at reception',
    timestamp: '2 hours ago'
  }
];

export const generateMockTelemetry = () => {
  return {
    speed: Math.floor(Math.random() * (60 - 30) + 30) + ' km/h',
    heading: Math.floor(Math.random() * 360) + '°'
  };
};
