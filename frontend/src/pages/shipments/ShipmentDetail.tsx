import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Navigation, Truck, User, Calendar, Map, CheckCircle2, AlertTriangle, FileText, CheckCircle, FastForward } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDomain } from '@/context/DomainContext';
import { formatFriendlyDate, formatRelativeTime } from '@/utils/dateFormatter';

export function ShipmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { shipments, drivers, updateShipmentStatus, getShipmentView, getShipmentPackages, getVehicleForDriver, getShipmentStatusHistory } = useDomain();
  
  const shipment = shipments.find(s => s.id === id || s.trackingNumber === id);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const [newStatus, setNewStatus] = useState(shipment?.status || 'Draft');

  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [newTimelineLoc, setNewTimelineLoc] = useState('');

  // Derived Info
  const view = getShipmentView(shipment?.id || '');
  const pkgs = getShipmentPackages(shipment?.id || '');
  const pkg = pkgs.length > 0 ? pkgs[0] : null;
  const history = getShipmentStatusHistory(shipment?.id || '');
  
  const [editedPriority, setEditedPriority] = useState(shipment?.priority || 'Standard');
  const [editedWeight, setEditedWeight] = useState((pkg?.weight || 0).toString());
  const [editedDescription, setEditedDescription] = useState(pkg?.description || '');
  const [editedIsFragile, setEditedIsFragile] = useState(pkg?.fragile || false);
  const [editedInstructions, setEditedInstructions] = useState(shipment?.deliveryInstructions || '');

  const driver = drivers.find(d => d.id === shipment?.driverId);
  const vehicle = driver ? getVehicleForDriver(driver.id) : undefined;

  if (!shipment) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto flex flex-col items-center justify-center pt-20">
        <AlertTriangle className="h-16 w-16 text-warning-500 mb-4" />
        <h1 className="text-2xl font-bold text-navy-900">Shipment Not Found</h1>
        <p className="text-navy-500">The shipment with ID {id} could not be found.</p>
        <Button onClick={() => navigate('/shipments')} className="mt-4">Return to Shipments</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'Administrator';
  const isDriver = user?.role === 'Driver';
  
  const isAssignedToCurrentDriver = isDriver && driver?.name === user?.name;

  const handleNextStatus = () => {
    let nextStatus: any = null;
    if (shipment.status === 'Assigned') nextStatus = 'Picked Up';
    else if (shipment.status === 'Picked Up') nextStatus = 'In Transit';
    else if (shipment.status === 'In Transit') nextStatus = 'Out for Delivery';
    
    if (nextStatus) {
      updateShipmentStatus(shipment.id, nextStatus, user?.id || 'sys', 'Detail view');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-navy-900">{shipment.trackingNumber}</h1>
          <Badge variant={shipment.status === 'Delivered' ? 'success' : shipment.status === 'Failed' ? 'warning' : 'info'}>{shipment.status}</Badge>
          <Badge variant={shipment.priority === 'Urgent' ? 'danger' : shipment.priority === 'High' ? 'warning' : 'default'}>{shipment.priority} Priority</Badge>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <>

              <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>Edit Details</Button>
              <Button onClick={() => setIsStatusModalOpen(true)}>Update Status</Button>
            </>
          )}
          
          {isAssignedToCurrentDriver && (
            <>
               {(['Assigned', 'Picked Up', 'In Transit'].includes(shipment.status)) && (
                 <Button onClick={handleNextStatus}><FastForward className="h-4 w-4 mr-2" /> Advance Status</Button>
               )}
               {shipment.status === 'Out for Delivery' && (
                 <Button onClick={() => navigate('/pod/signature')} className="bg-success-600 hover:bg-success-700 text-white"><CheckCircle className="h-4 w-4 mr-2" /> Mark Delivered</Button>
               )}
               {shipment.status === 'Delivered' && (
                 <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> View POD</Button>
               )}
            </>
          )}
          
          <Link to={`/tracking/${id}`}>
            <Button variant="outline"><Map className="h-4 w-4 mr-2" /> Live Tracking</Button>
          </Link>
        </div>
      </div>

      {/* Edit Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-navy-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-navy-900">Edit Shipment Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-navy-400 hover:text-navy-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Priority</label>
                <select 
                  className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value as any)}
                >
                  <option value="Standard">Standard</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Package Weight (kg)</label>
                  <input 
                    type="number"
                    className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    value={editedWeight}
                    onChange={(e) => setEditedWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Contents Description</label>
                  <input 
                    type="text"
                    className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="fragile" 
                  checked={editedIsFragile}
                  onChange={(e) => setEditedIsFragile(e.target.checked)}
                  className="rounded border-navy-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="fragile" className="text-sm font-medium text-navy-700">Mark as Fragile</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Delivery Instructions</label>
                <textarea 
                  className="w-full h-20 px-3 py-2 border border-navy-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                  value={editedInstructions}
                  onChange={(e) => setEditedInstructions(e.target.value)}
                  placeholder="e.g., Leave at front desk"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-navy-100 bg-navy-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                // In a real app we'd dispatch an update here
                setIsEditModalOpen(false);
              }}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-navy-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-navy-900">Update Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-navy-400 hover:text-navy-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">New Status</label>
                <select 
                  className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                >
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-navy-100 bg-navy-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                updateShipmentStatus(shipment.id, newStatus as any, user?.id || 'sys', 'Manual Override');
                setIsStatusModalOpen(false);
              }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}


      {/* Update Timeline Modal */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-navy-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-navy-900">Add Timeline Event</h3>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-navy-400 hover:text-navy-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Update Message</label>
                <input 
                  type="text"
                  className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={newTimelineTitle}
                  onChange={(e) => setNewTimelineTitle(e.target.value)}
                  placeholder="e.g. Traffic delay, Approaching destination"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Current Location</label>
                <input 
                  type="text"
                  className="w-full h-10 px-3 py-2 border border-navy-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={newTimelineLoc}
                  onChange={(e) => setNewTimelineLoc(e.target.value)}
                  placeholder="e.g. Pune Highway"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-navy-100 bg-navy-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsTimelineModalOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (newTimelineTitle) {
                  updateShipmentStatus(shipment.id, shipment.status, user?.id || 'sys', newTimelineLoc || 'In Route', newTimelineTitle);
                  setNewTimelineTitle('');
                  setNewTimelineLoc('');
                  setIsTimelineModalOpen(false);
                }
              }}>Add Event</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-navy-100">
              <CardTitle>Delivery Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-navy-500 mb-1">Origin (Sender)</p>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-navy-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy-900">{shipment.organizationId}</p>
                      <p className="text-sm text-navy-600">{view?.originAddressLabel}</p>
                      <p className="text-xs text-navy-400 mt-1">Contact Details on File</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-navy-500 mb-1">Destination (Receiver)</p>
                  <div className="flex items-start">
                    <Navigation className="h-5 w-5 text-navy-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy-900">Destination Facility</p>
                      <p className="text-sm text-navy-600">{view?.destinationAddressLabel}</p>
                      <p className="text-xs text-navy-400 mt-1">Contact Details on File</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-navy-900">Delivery Progress</span>
                  <span className="font-medium text-primary-600">{view?.progressPercentage}%</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${view?.progressPercentage}%` }} />
                </div>
                <div className="flex justify-between text-xs text-navy-500 mt-2">
                  <span>Picked up</span>
                  <span>In transit</span>
                  <span>Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Tracking Timeline</CardTitle>
              {(isAdmin || isAssignedToCurrentDriver) && (
                <Button variant="outline" size="sm" onClick={() => setIsTimelineModalOpen(true)}>
                  Add Update
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-navy-200 ml-3 space-y-8 pb-4">
                {history.map((event, i) => (
                  <div key={event.id} className="relative pl-6">
                    {i === 0 ? (
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-primary-50" />
                    ) : (
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-navy-300" />
                    )}
                    <h4 className={`text-sm font-semibold ${i === 0 ? 'text-primary-700' : 'text-navy-900'}`}>{event.newStatus}</h4>
                    <p className="text-sm text-navy-500 mt-0.5">{formatRelativeTime(event.timestamp)} • {event.location || 'System'}</p>
                    {event.note && <p className="text-sm text-navy-600 italic mt-1">{event.note}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Driver & Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mt-2">
                <div className="h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-navy-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-navy-900">{driver?.name || 'Not Assigned'}</p>
                  <p className="text-xs text-navy-500">{driver?.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center mt-4 pt-4 border-t border-navy-100">
                <div className="h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-navy-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-navy-900">{vehicle?.registrationNumber || 'Not Assigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Package & Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-navy-500">Contents</p>
                  <p className="text-sm font-medium text-navy-900">{pkg?.description || 'General Goods'}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Weight</p>
                  <p className="text-sm font-medium text-navy-900">{pkg?.weight || 0} kg</p>
                </div>
              </div>
              {pkg?.fragile && (
                <div className="flex items-center text-danger-600 bg-danger-50 p-2 rounded text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Fragile Content
                </div>
              )}
              <div>
                <p className="text-xs text-navy-500">Delivery Instructions</p>
                <p className="text-sm font-medium text-navy-900 bg-navy-50 p-2 rounded mt-1">
                  {shipment.deliveryInstructions || 'None'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ETA Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-navy-400 mr-3" />
                <div>
                  <p className="text-sm text-navy-500">Predicted Arrival</p>
                  <p className="font-semibold text-navy-900">{formatFriendlyDate(shipment.scheduledDelivery)}</p>
                </div>
              </div>
              <div className="flex items-center text-success-600 bg-success-50 p-2 rounded text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                On track for delivery SLA
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
