import { apiClient } from './apiClient';
import { CreateShipmentRequest, UpdateShipmentStatusRequest, UpdateShipmentRequest } from '../types/api';
import { Shipment, ShipmentPackage, ShipmentStatusEvent, Address, Priority, ShipmentStatus } from '../types/domain';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface BackendShipmentResponse {
  id: string;
  trackingNumber: string;
  organizationId: string;
  serviceType: string;
  priority: string;
  status: string;
  customerName: string;
  recipientName: string;
  recipientPhone: string;
  originAddress: Address | null;
  destinationAddress: Address;
  packages: any[];
  history: any[];
  scheduledPickup?: string;
  scheduledDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

const mapBackendToFrontendShipment = (backend: BackendShipmentResponse): Shipment => {
  // Map backend enum DRAFT to Draft, etc.
  const statusMap: Record<string, ShipmentStatus> = {
    'DRAFT': 'Draft',
    'READY_FOR_PLANNING': 'Ready for Planning',
    'READY_FOR_DISPATCH': 'Planned', // Or Assigned
    'IN_TRANSIT': 'In Transit',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled'
  };

  const priorityMap: Record<string, Priority> = {
    'NORMAL': 'Standard',
    'HIGH': 'High',
    'URGENT': 'Urgent'
  };

  return {
    id: backend.id,
    trackingNumber: backend.trackingNumber,
    organizationId: backend.organizationId,
    serviceType: backend.serviceType,
    priority: priorityMap[backend.priority] || 'Standard',
    originAddressId: backend.originAddress ? backend.originAddress.id : '',
    destinationAddressId: backend.destinationAddress ? backend.destinationAddress.id : '',
    originAddressLabel: backend.originAddress ? `${backend.originAddress.city || ''}, ${backend.originAddress.state || ''}`.trim().replace(/^,|,$/g, '') : '',
    destinationAddressLabel: backend.destinationAddress ? `${backend.destinationAddress.city || ''}, ${backend.destinationAddress.state || ''}`.trim().replace(/^,|,$/g, '') : '',
    senderName: backend.customerName, // Mapped customerName to senderName for UI compatibility
    senderPhone: '', 
    recipientName: backend.recipientName,
    recipientPhone: backend.recipientPhone,
    driverId: null,
    routeId: null,
    status: statusMap[backend.status] || 'Draft',
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
    scheduledPickup: backend.scheduledPickup,
    scheduledDelivery: backend.scheduledDelivery,
    history: backend.history ? backend.history.map((h: any) => ({
      id: h.id || Math.random().toString(),
      shipmentId: backend.id,
      previousStatus: null,
      newStatus: statusMap[h.status] || 'Draft',
      actorType: 'SYSTEM' as const,
      actorUserId: null,
      timestamp: h.timestamp,
      note: h.note,
      location: h.location
    })) : [],
    packages: backend.packages ? backend.packages.map((p: any) => ({
      id: p.id || Math.random().toString(),
      shipmentId: backend.id,
      description: p.description,
      quantity: 1,
      weight: p.weightKg || 0,
      dimensions: {
        length: p.lengthCm || 0,
        width: p.widthCm || 0,
        height: p.heightCm || 0,
      },
      packageType: p.packageType || 'BOX',
      fragile: p.fragile || false
    })) : []
  };
};

export const shipmentService = {
  getShipments: async (page = 0, size = 10, search?: string, status?: string) => {
    let url = `/shipments?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) {
      // Map frontend status back to backend status for filtering if needed
      const reverseStatusMap: Record<string, string> = {
        'Draft': 'DRAFT',
        'Ready for Planning': 'READY_FOR_PLANNING',
        'Planned': 'READY_FOR_DISPATCH',
        'Assigned': 'READY_FOR_DISPATCH',
        'In Transit': 'IN_TRANSIT',
        'Out for Delivery': 'OUT_FOR_DELIVERY',
        'Delivered': 'DELIVERED',
        'Cancelled': 'CANCELLED'
      };
      const backendStatus = reverseStatusMap[status];
      if (backendStatus) url += `&status=${encodeURIComponent(backendStatus)}`;
    }
    
    const res = await apiClient.get<PageResponse<BackendShipmentResponse>>(url);
    return {
      ...res,
      content: res.content.map(mapBackendToFrontendShipment)
    };
  },

  getShipmentByTrackingNumber: async (trackingNumber: string) => {
    const res = await apiClient.get<BackendShipmentResponse>(`/shipments/${trackingNumber}`);
    return {
      shipment: mapBackendToFrontendShipment(res),
      rawResponse: res
    };
  },

  createShipment: async (req: CreateShipmentRequest) => {
    // Helper to extract city/state from comma separated string
    const parseAddress = (addressStr: string) => {
      if (!addressStr) return null;
      const parts = addressStr.split(',').map(s => s.trim());
      if (parts.length >= 3) {
        return {
          line1: parts.slice(0, parts.length - 2).join(', '),
          city: parts[parts.length - 2],
          state: parts[parts.length - 1].split(' ')[0] || parts[parts.length - 1],
          postalCode: parts[parts.length - 1].split(' ')[1] || '00000',
          country: 'US'
        };
      } else if (parts.length === 2) {
        return {
          line1: parts[0],
          city: parts[1],
          state: 'N/A',
          postalCode: '00000',
          country: 'US'
        };
      }
      return {
        line1: addressStr,
        city: addressStr,
        state: 'N/A',
        postalCode: '00000',
        country: 'US'
      };
    };

    // We map frontend CreateShipmentRequest to backend CreateShipmentRequest
    const backendReq = {
      customerName: req.senderName || 'Unknown Customer',
      serviceType: req.serviceType,
      priority: req.priority === 'Standard' ? 'NORMAL' : req.priority.toUpperCase(),
      recipientName: req.recipientName || 'Unknown',
      recipientPhone: req.recipientPhone || '0000000000',
      originAddress: req.pickupAddress ? parseAddress(req.pickupAddress) : null,
      deliveryAddress: parseAddress(req.deliveryInstructions || 'Mapped Address, City, State'),
      packages: req.packages.map((p: any) => ({
        description: p.description,
        weightKg: p.weight,
        packageType: p.packageType || 'BOX',
        fragile: p.fragile
      }))
    };
    const res = await apiClient.post<BackendShipmentResponse>('/shipments', backendReq);
    return mapBackendToFrontendShipment(res);
  },

  updateShipment: async (id: string, req: UpdateShipmentRequest) => {
    const res = await apiClient.patch<BackendShipmentResponse>(`/shipments/${id}`, req);
    return mapBackendToFrontendShipment(res);
  },

  updateShipmentStatus: async (req: UpdateShipmentStatusRequest) => {
    const reverseStatusMap: Record<string, string> = {
      'Draft': 'DRAFT',
      'Ready for Planning': 'READY_FOR_PLANNING',
      'Planned': 'READY_FOR_DISPATCH',
      'Assigned': 'READY_FOR_DISPATCH',
      'In Transit': 'IN_TRANSIT',
      'Out for Delivery': 'OUT_FOR_DELIVERY',
      'Delivered': 'DELIVERED',
      'Cancelled': 'CANCELLED'
    };
    
    const res = await apiClient.patch<BackendShipmentResponse>(`/shipments/${req.shipmentId}/status`, {
      newStatus: reverseStatusMap[req.newStatus] || 'DRAFT',
      location: req.location,
      note: req.note
    });
    return mapBackendToFrontendShipment(res);
  }
};
