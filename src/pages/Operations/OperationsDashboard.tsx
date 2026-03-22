import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/UI/StatusBadge';
import { Shipment } from '../../types';

const OperationsDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchAllShipments = async () => {
      try {
        const response = await api.get('/shipments/');
        setShipments(response.data.reverse()); // Newest first
      } catch (error) {
        console.error("Failed to fetch all shipments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllShipments();
  }, []);

  // Calculate stats for the top cards
  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending' || s.status === 'CREATED').length,
    inTransit: shipments.filter(s => ['picked_up', 'in_transit', 'arrived_at_hub', 'handed_over'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  // Filter the table based on the selected tab
  const filteredShipments = shipments.filter(shipment => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return shipment.status === 'pending' || shipment.status === 'CREATED';
    if (activeTab === 'assigned') return shipment.status === 'assigned';
    if (activeTab === 'in_transit') return ['picked_up', 'in_transit', 'arrived_at_hub', 'handed_over'].includes(shipment.status);
    if (activeTab === 'delivered') return shipment.status === 'delivered';
    return true;
  });

  if (loading) return <div className="p-6 text-gray-500">Loading Operations Control Tower...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Operations Control Tower</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total System Shipments', stat: stats.total, color: 'bg-blue-50 text-blue-700' },
          { name: 'Action Required (Pending)', stat: stats.pending, color: 'bg-red-50 text-red-700' },
          { name: 'Currently In Transit', stat: stats.inTransit, color: 'bg-orange-50 text-orange-700' },
          { name: 'Successfully Delivered', stat: stats.delivered, color: 'bg-green-50 text-green-700' },
        ].map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className={`px-4 py-5 sm:p-6 ${item.color}`}>
              <dt className="text-sm font-medium truncate opacity-80">{item.name}</dt>
              <dd className="mt-1 text-3xl font-bold">{item.stat}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 flex space-x-4">
          {['all', 'pending', 'assigned', 'in_transit', 'delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab ? 'border-[#D97706] text-[#D97706]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No shipments found in this category.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shipment.shipment_code || 'Pending'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-semibold text-gray-700">{shipment.pickup_city}</span> &rarr; <span className="font-semibold text-gray-700">{shipment.receiver_city}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      
                      {/* Dynamic Action Buttons based on Status */}
                      {(shipment.status === 'pending' || shipment.status === 'CREATED') && (
                        <Link to={`/operations/assign/${shipment.id}`} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm">
                          Assign
                        </Link>
                      )}
                      
                      {['in_transit', 'arrived_at_hub'].includes(shipment.status) && (
                        <Link to={`/operations/handover/${shipment.id}`} className="text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded shadow-sm">
                          Handover
                        </Link>
                      )}

                      <button className="text-[#1B2A4A] hover:text-[#D97706] bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                        Track
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationsDashboard;