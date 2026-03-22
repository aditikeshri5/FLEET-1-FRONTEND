import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/UI/StatusBadge';
import { Shipment } from '../../types';

const ManufacturerDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await api.get('/shipments/');
        
        // Filter out only this manufacturer's shipments
        const myShipments = response.data.filter(
          (s: Shipment) => s.manufacturer_id === userId
        );
        
        // Sort by newest first (assuming larger ID or sorting conceptually)
        setShipments(myShipments.reverse());
      } catch (error) {
        console.error("Failed to fetch shipments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending' || s.status === 'CREATED').length,
    inTransit: shipments.filter(s => ['picked_up', 'in_transit', 'arrived_at_hub', 'handed_over'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
  };

  const recentShipments = shipments.slice(0, 5); // Just show the top 5 on the dashboard

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <Link
          to="/manufacturer/shipments/new"
          className="bg-[#D97706] text-white px-4 py-2 rounded-md hover:bg-[#b46205] transition shadow-sm font-medium"
        >
          + Create Shipment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Shipments', stat: stats.total },
          { name: 'Pending', stat: stats.pending },
          { name: 'In Transit', stat: stats.inTransit },
          { name: 'Delivered', stat: stats.delivered },
        ].map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{item.stat}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Shipments</h3>
          <Link to="/manufacturer/shipments" className="text-sm text-[#D97706] hover:text-[#b46205] font-medium">
            View All Shipments &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentShipments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 text-sm">
                    No shipments created yet.
                  </td>
                </tr>
              ) : (
                recentShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shipment.shipment_code || 'Pending Code'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.pickup_city} &rarr; {shipment.receiver_city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/manufacturer/shipments/${shipment.id}`} className="text-[#1B2A4A] hover:text-[#D97706]">
                        Track
                      </Link>
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

export default ManufacturerDashboard;