export interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  location: string;
  note?: string;
}

export interface ShipmentData {
  id: string;
  tracking: string;
  customer: string;
  customerId: string;
  origin: string;
  destination: string;
  status: 'Draft' | 'Ready for Planning' | 'Planned' | 'Assigned' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exceptions' | 'Cancelled';
  priority: 'Standard' | 'High' | 'Urgent';
  driverId: string | null;
  routeId: string | null;
  vehicleId: string | null;
  eta: string;
  lastUpdated: string;
  progress: number;
  distance?: string;
  packageCount?: number;
  deadline?: string;
  statusHistory: TimelineEvent[];
}

export const MOCK_VEHICLES = [
  { id: 'VEH-001', registration: 'MH-12-AB-4821', type: 'Heavy Truck', capacity: 1000, status: 'Available' },
  { id: 'VEH-002', registration: 'MH-14-XY-9922', type: 'Medium Truck', capacity: 500, status: 'In Maintenance' },
  { id: 'VEH-003', registration: 'MH-01-AB-1234', type: 'Refrigerated', capacity: 750, status: 'Available' },
  { id: 'VEH-004', registration: 'MH-43-XY-5544', type: 'Light Van', capacity: 250, status: 'Available' }
];

export const MOCK_DRIVERS = [
  { id: 'DRV-001', name: 'Rahul Sharma', phone: '+91 98765 43210', status: 'Active', vehicleId: 'VEH-001' },
  { id: 'DRV-002', name: 'Amit Singh', phone: '+91 98765 11111', status: 'Off Duty', vehicleId: 'VEH-002' },
  { id: 'DRV-003', name: 'Vijay Singh', phone: '+91 98765 22222', status: 'Active', vehicleId: 'VEH-003' },
  { id: 'DRV-004', name: 'Suresh Kumar', phone: '+91 98765 33333', status: 'Active', vehicleId: 'VEH-004' },
  { id: 'DRV-005', name: 'Unassigned Driver', phone: '+91 98765 00000', status: 'Active', vehicleId: null }
];

export const MOCK_SHIPMENTS: ShipmentData[] = [
  {
    id: '1',
    tracking: 'STP-2026-10481',
    customer: 'Acme Retail',
    customerId: 'CUST-001',
    origin: 'Mumbai DC',
    destination: 'Pune Business Park',
    status: 'In Transit',
    priority: 'High',
    driverId: 'DRV-001',
    routeId: 'RT102',
    vehicleId: 'VEH-001',
    eta: 'Today, 2:30 PM',
    lastUpdated: '15 mins ago',
    progress: 75,
    distance: '145 km',
    packageCount: 25,
    deadline: 'Today 18:00',
    statusHistory: [
      { id: 'h1', status: 'In Transit', timestamp: '15 mins ago', location: 'Mumbai DC' },
      { id: 'h2', status: 'Picked Up', timestamp: '1 hour ago', location: 'Mumbai DC' },
      { id: 'h3', status: 'Assigned', timestamp: '2 hours ago', location: 'System' }
    ]
  },
  {
    id: '2',
    tracking: 'STP-2026-10482',
    customer: 'Nova Electronics',
    customerId: 'CUST-002',
    origin: 'Delhi Hub',
    destination: 'Gurgaon Tech Park',
    status: 'Delivered',
    priority: 'Standard',
    driverId: 'DRV-002',
    routeId: 'RT104',
    vehicleId: 'VEH-002',
    eta: '-',
    lastUpdated: '2 hours ago',
    progress: 100,
    distance: '32 km',
    packageCount: 5,
    deadline: '-',
    statusHistory: [
      { id: 'h4', status: 'Delivered', timestamp: '2 hours ago', location: 'Gurgaon Tech Park' }
    ]
  },
  {
    id: '3',
    tracking: 'STP-2026-10483',
    customer: 'UrbanCart',
    customerId: 'CUST-003',
    origin: 'Bangalore Center',
    destination: 'Chennai Hub',
    status: 'Exceptions',
    priority: 'Urgent',
    driverId: 'DRV-001',
    routeId: 'RT102',
    vehicleId: 'VEH-001',
    eta: 'Delayed',
    lastUpdated: '5 mins ago',
    progress: 45,
    distance: '340 km',
    packageCount: 12,
    deadline: 'Tomorrow 10:00',
    statusHistory: [
      { id: 'h5', status: 'Exceptions', timestamp: '5 mins ago', location: 'Highway 4', note: 'Vehicle breakdown' }
    ]
  },
  {
    id: '4',
    tracking: 'STP-2026-10484',
    customer: 'FreshFoods',
    customerId: 'CUST-004',
    origin: 'Hyderabad',
    destination: 'Pune Business Park',
    status: 'Ready for Planning',
    priority: 'Urgent',
    driverId: null,
    routeId: null,
    vehicleId: null,
    eta: '-',
    lastUpdated: '1 hour ago',
    progress: 0,
    distance: '500 km',
    packageCount: 8,
    deadline: 'Tomorrow 20:00',
    statusHistory: [
      { id: 'h6', status: 'Ready for Planning', timestamp: '1 hour ago', location: 'System' }
    ]
  },
  {
    id: '5',
    tracking: 'STP-2026-10485',
    customer: 'Acme Retail',
    customerId: 'CUST-001',
    origin: 'Mumbai DC',
    destination: 'Surat',
    status: 'Ready for Planning',
    priority: 'Standard',
    driverId: null,
    routeId: null,
    vehicleId: null,
    eta: '-',
    lastUpdated: '2 hours ago',
    progress: 0,
    distance: '280 km',
    packageCount: 40,
    deadline: 'Tomorrow 12:00',
    statusHistory: [
      { id: 'h7', status: 'Ready for Planning', timestamp: '2 hours ago', location: 'System' }
    ]
  },
  {
    id: '6',
    tracking: 'STP-2026-10486',
    customer: 'Global Logistics',
    customerId: 'CUST-005',
    origin: 'Kolkata Port',
    destination: 'Bhubaneswar',
    status: 'Assigned',
    priority: 'High',
    driverId: 'DRV-003',
    routeId: 'RT105',
    vehicleId: 'VEH-003',
    eta: 'Tomorrow, 10:00 AM',
    lastUpdated: '30 mins ago',
    progress: 10,
    distance: '440 km',
    packageCount: 15,
    deadline: 'Tomorrow 16:00',
    statusHistory: [
      { id: 'h8', status: 'Assigned', timestamp: '30 mins ago', location: 'System' }
    ]
  },
  {
    id: '7',
    tracking: 'STP-2026-10487',
    customer: 'Nova Electronics',
    customerId: 'CUST-002',
    origin: 'Pune Hub',
    destination: 'Mumbai South',
    status: 'Out for Delivery',
    priority: 'Standard',
    driverId: 'DRV-004',
    routeId: 'RT101',
    vehicleId: 'VEH-004',
    eta: 'Today, 4:00 PM',
    lastUpdated: '10 mins ago',
    progress: 90,
    distance: '150 km',
    packageCount: 2,
    deadline: 'Today 16:00',
    statusHistory: [
      { id: 'h9', status: 'Out for Delivery', timestamp: '10 mins ago', location: 'Mumbai South' }
    ]
  },
  {
    id: '8',
    tracking: 'STP-2026-10488',
    customer: 'Acme Retail',
    customerId: 'CUST-001',
    origin: 'Delhi Hub',
    destination: 'Noida',
    status: 'Draft',
    priority: 'Standard',
    driverId: null,
    routeId: null,
    vehicleId: null,
    eta: '-',
    lastUpdated: '1 day ago',
    progress: 0,
    distance: '25 km',
    packageCount: 1,
    deadline: '-',
    statusHistory: [
      { id: 'h10', status: 'Draft', timestamp: '1 day ago', location: 'System' }
    ]
  }
];

export const generateMockTelemetry = () => {
  return {
    speed: Math.floor(Math.random() * (60 - 30) + 30) + ' km/h',
    heading: Math.floor(Math.random() * 360) + '°'
  };
};
