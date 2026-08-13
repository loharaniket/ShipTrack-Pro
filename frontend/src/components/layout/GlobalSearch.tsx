import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, User, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || ''))) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mockShipments = [
    { id: 'STP-2026-10482', client: 'Acme Retail', status: 'In Transit' },
    { id: 'STP-2026-10483', client: 'TechCorp', status: 'Delivered' },
    { id: 'STP-2026-10484', client: 'GlobalMart', status: 'Processing' },
  ];

  const mockDrivers = [
    { name: 'Rahul Sharma', vehicle: 'MH-12-AB-4821', status: 'Delivering' },
    { name: 'Amit Singh', vehicle: 'MH-14-XY-9922', status: 'Available' },
  ];

  const filteredShipments = mockShipments.filter(s => s.id.toLowerCase().includes(query.toLowerCase()) || s.client.toLowerCase().includes(query.toLowerCase()));
  const filteredDrivers = mockDrivers.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.vehicle.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-navy-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-navy-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-navy-100">
          <Search className="h-5 w-5 text-navy-400 mr-3" />
          <input 
            autoFocus
            className="flex-1 bg-transparent border-0 focus:ring-0 text-lg outline-none placeholder:text-navy-300"
            placeholder="Search Shipments, Drivers, Routes... (Press '/' or Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-xs text-navy-400 bg-navy-50 px-2 py-1 rounded border border-navy-200">ESC</div>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-2">
          {query.length > 0 ? (
            <div className="space-y-1">
              {filteredShipments.length > 0 && (
                <>
                  <div className="px-3 py-1 text-xs font-semibold text-navy-500 uppercase tracking-wider">Shipments</div>
                  {filteredShipments.map(s => (
                    <button key={s.id} onClick={() => { setIsOpen(false); navigate(`/shipments/${s.id}`); }} className="w-full flex items-center px-3 py-2 hover:bg-navy-50 rounded-lg text-left">
                      <Package className="h-4 w-4 mr-3 text-primary-500" />
                      <div>
                        <div className="text-sm font-medium text-navy-900">{s.id}</div>
                        <div className="text-xs text-navy-500">{s.client} • {s.status}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
              
              {filteredDrivers.length > 0 && (
                <>
                  <div className="px-3 py-1 text-xs font-semibold text-navy-500 uppercase tracking-wider mt-2">Drivers</div>
                  {filteredDrivers.map(d => (
                    <button key={d.name} onClick={() => { setIsOpen(false); navigate('/drivers'); }} className="w-full flex items-center px-3 py-2 hover:bg-navy-50 rounded-lg text-left">
                      <User className="h-4 w-4 mr-3 text-info-500" />
                      <div>
                        <div className="text-sm font-medium text-navy-900">{d.name}</div>
                        <div className="text-xs text-navy-500">{d.vehicle} • {d.status}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {filteredShipments.length === 0 && filteredDrivers.length === 0 && (
                <div className="px-4 py-8 text-center text-navy-400">
                  No results found for "{query}"
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-navy-400">
              Type to search across the entire platform
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
