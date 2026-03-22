import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/UI/StatusBadge';
import { Shipment } from '../../types';

const ShipmentList: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await api.get('/shipments/');
        
        // Filter out only this manufacturer's shipments [cite: 625]
        const myShipments = response.data.filter(
          (s: Shipment) => s.manufacturer_id === userId
        );
        
        setShipments(myShipments.reverse());
      } catch (error) {
        console.error("Failed to fetch shipments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Apply Search and Status Filters [cite: 630, 631]
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      (shipment.shipment_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.receiver_city || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Shipments</h1>
        <Link
          to="/manufacturer/shipments/new"
          className="bg-[#D97706] text-white px-4 py-2 rounded-md hover:bg-[#b46205] transition shadow-sm font-medium"
        >
          + Create Shipment
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Code or Receiver City..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="arrived_at_hub">Arrived at Hub</option>
          <option value="handed_over">Handed Over</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading shipments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No shipments found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shipment.shipment_code || 'Pending'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-semibold">{shipment.pickup_city}</span> &rarr; <span className="font-semibold">{shipment.receiver_city}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.goods_description || 'N/A'} ({shipment.quantity} units)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/manufacturer/shipments/${shipment.id}`} className="text-[#1B2A4A] hover:text-[#D97706] bg-gray-100 px-3 py-1 rounded">
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentList;