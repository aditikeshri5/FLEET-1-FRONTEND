import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/UI/StatusBadge';
import Timeline from '../../components/UI/Timeline';
import { Shipment, StatusUpdate } from '../../types';

const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetailAndHistory = async () => {
      try {
        // 1. Fetch all shipments and find ours client-side (per API specs)
        const shipmentsRes = await api.get('/shipments/');
        const foundShipment = shipmentsRes.data.find((s: Shipment) => s.id === id);

        if (!foundShipment) {
          setError("Shipment not found.");
          setLoading(false);
          return;
        }
        setShipment(foundShipment);

        // 2. Fetch the tracking timeline
        try {
          const historyRes = await api.get(`/status/${id}`);
          setStatusHistory(historyRes.data);
        } catch (historyErr) {
          console.warn("No status history found yet.", historyErr);
          setStatusHistory([]);
        }

      } catch (err) {
        console.error("Failed to fetch shipment details", err);
        setError("Failed to load shipment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetailAndHistory();
    }
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500 font-medium">Loading tracking data...</div>;
  if (error || !shipment) return <div className="p-6 text-red-600 bg-red-50 rounded-md border border-red-200 m-6">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Shipment {shipment.shipment_code || 'Processing...'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            UUID: {shipment.id}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Status</span>
            <StatusBadge status={shipment.status} />
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <Link to="/manufacturer/shipments" className="text-sm text-[#D97706] hover:text-[#b46205] font-medium transition-colors">
            &larr; Back to List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Shipment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#1B2A4A] px-6 py-4">
              <h3 className="text-lg font-medium text-white tracking-wide">Route & Cargo Details</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Origin */}
                <div className="relative">
                  <div className="absolute top-1 -left-4 w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Origin (Pickup)</p>
                  <p className="text-lg font-semibold text-gray-900">{shipment.pickup_city}</p>
                  <p className="text-sm text-gray-600 mt-2">{shipment.pickup_address}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {shipment.pickup_contact}
                  </p>
                </div>
                
                {/* Destination */}
                <div className="relative">
                  <div className="absolute top-1 -left-4 w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Destination (Receiver)</p>
                  <p className="text-lg font-semibold text-gray-900">{shipment.receiver_name}</p>
                  <p className="text-sm text-gray-600 mt-2">{shipment.receiver_address}</p>
                  <p className="text-sm text-gray-600">{shipment.receiver_city}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {shipment.receiver_phone}
                  </p>
                </div>
              </div>
              
              {/* Goods Separator */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                 <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Package Contents</p>
                 <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                   <p className="text-sm text-gray-800 font-medium mb-3">{shipment.goods_description || 'No description provided'}</p>
                   <div className="flex space-x-8">
                     <p className="text-sm flex flex-col"><span className="text-gray-500 text-xs mb-1">Quantity</span> <span className="font-semibold text-lg">{shipment.quantity} units</span></p>
                     <p className="text-sm flex flex-col"><span className="text-gray-500 text-xs mb-1">Total Weight</span> <span className="font-semibold text-lg">{shipment.weight} kg</span></p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking Timeline */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-medium text-gray-900">Tracking History</h3>
          </div>
          <div className="p-6">
            <Timeline updates={statusHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;