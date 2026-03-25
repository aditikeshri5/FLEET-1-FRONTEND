import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Overview</h1>
        <p className="text-slate-500">Fleet-1 Logistics Network Summary</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600">
          <p className="text-sm text-gray-500 font-medium uppercase">Total Users</p>
          <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600">
          <p className="text-sm text-gray-500 font-medium uppercase">Manufacturers</p>
          <p className="text-2xl font-bold">{stats?.manufacturers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600">
          <p className="text-sm text-gray-500 font-medium uppercase">Transporters</p>
          <p className="text-2xl font-bold">{stats?.transporters || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-600">
          <p className="text-sm text-gray-500 font-medium uppercase">Total Shipments</p>
          <p className="text-2xl font-bold">{stats?.total_shipments || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links or Recent Activity could go here */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="font-bold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Manage Users
            </button>
            <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50">
              View Network Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;