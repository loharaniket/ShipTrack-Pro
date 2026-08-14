export interface ShipmentData {
  id: string;
  tracking: string;
  customer: string;
  origin: string;
  destination: string;
  status: 'Draft' | 'Ready for Planning' | 'Planned' | 'Assigned' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exceptions' | 'Cancelled';
  priority: 'Standard' | 'High' | 'Urgent';
  driver: string | null;
  route: string | null;
  vehicle: string | null;
  eta: string;
  lastUpdated: string;
  progress: number;
  distance?: string;
  packageCount?: number;
  deadline?: string;
}

export const MOCK_SHIPMENTS: ShipmentData[] = [
  {
    id: '1',
    tracking: 'STP-2026-10481',
    customer: 'Acme Retail',
    origin: 'Mumbai DC',
    destination: 'Pune Business Park',
    status: 'In Transit',
    priority: 'High',
    driver: 'Rahul Sharma',
    route: 'RT102',
    vehicle: 'MH-12-AB-4821',
    eta: 'Today, 2:30 PM',
    lastUpdated: '15 mins ago',
    progress: 75,
    distance: '145 km',
    packageCount: 25,
    deadline: 'Today 18:00',
  },
  {
    id: '2',
    tracking: 'STP-2026-10482',
    customer: 'Nova Electronics',
    origin: 'Delhi Hub',
    destination: 'Gurgaon Tech Park',
    status: 'Delivered',
    priority: 'Standard',
    driver: 'Amit Singh',
    route: 'RT104',
    vehicle: 'MH-14-XY-9922',
    eta: '-',
    lastUpdated: '2 hours ago',
    progress: 100,
    distance: '32 km',
    packageCount: 5,
    deadline: '-',
  },
  {
    id: '3',
    tracking: 'STP-2026-10483',
    customer: 'UrbanCart',
    origin: 'Bangalore Center',
    destination: 'Chennai Hub',
    status: 'Exceptions',
    priority: 'Urgent',
    driver: 'Rahul Sharma',
    route: 'RT102',
    vehicle: 'MH-12-AB-4821',
    eta: 'Delayed',
    lastUpdated: '5 mins ago',
    progress: 45,
    distance: '340 km',
    packageCount: 12,
    deadline: 'Tomorrow 10:00',
  },
  {
    id: '4',
    tracking: 'STP-2026-10484',
    customer: 'FreshFoods',
    origin: 'Hyderabad',
    destination: 'Pune Business Park',
    status: 'Ready for Planning',
    priority: 'Urgent',
    driver: null,
    route: null,
    vehicle: null,
    eta: '-',
    lastUpdated: '1 hour ago',
    progress: 0,
    distance: '500 km',
    packageCount: 8,
    deadline: 'Tomorrow 20:00',
  },
  {
    id: '5',
    tracking: 'STP-2026-10485',
    customer: 'Acme Retail',
    origin: 'Mumbai DC',
    destination: 'Surat',
    status: 'Ready for Planning',
    priority: 'Standard',
    driver: null,
    route: null,
    vehicle: null,
    eta: '-',
    lastUpdated: '2 hours ago',
    progress: 0,
    distance: '280 km',
    packageCount: 40,
    deadline: 'Tomorrow 12:00',
  },
  {
    id: '6',
    tracking: 'STP-2026-10486',
    customer: 'Global Logistics',
    origin: 'Kolkata Port',
    destination: 'Bhubaneswar',
    status: 'Assigned',
    priority: 'High',
    driver: 'Vijay Singh',
    route: 'RT105',
    vehicle: 'MH-01-AB-1234',
    eta: 'Tomorrow, 10:00 AM',
    lastUpdated: '30 mins ago',
    progress: 10,
    distance: '440 km',
    packageCount: 15,
    deadline: 'Tomorrow 16:00',
  },
  {
    id: '7',
    tracking: 'STP-2026-10487',
    customer: 'Nova Electronics',
    origin: 'Pune Hub',
    destination: 'Mumbai South',
    status: 'Out for Delivery',
    priority: 'Standard',
    driver: 'Suresh Kumar',
    route: 'RT101',
    vehicle: 'MH-43-XY-5544',
    eta: 'Today, 4:00 PM',
    lastUpdated: '10 mins ago',
    progress: 90,
    distance: '150 km',
    packageCount: 2,
    deadline: 'Today 16:00',
  },
  {
    id: '8',
    tracking: 'STP-2026-10488',
    customer: 'Acme Retail',
    origin: 'Delhi Hub',
    destination: 'Noida',
    status: 'Draft',
    priority: 'Standard',
    driver: null,
    route: null,
    vehicle: null,
    eta: '-',
    lastUpdated: '1 day ago',
    progress: 0,
    distance: '25 km',
    packageCount: 1,
    deadline: '-',
  },
];

export const generateMockTelemetry = () => {
  return {
    speed: Math.floor(Math.random() * (60 - 30) + 30) + ' km/h',
    heading: Math.floor(Math.random() * 360) + '°'
  };
};
