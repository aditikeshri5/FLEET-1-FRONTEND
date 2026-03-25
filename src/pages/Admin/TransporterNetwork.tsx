import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const TransporterNetwork = () => {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const res = await api.get('/admin/users');
        // Filter only those with 'transporter' role
        const filtered = res.data.filter((u: any) => u.role === 'transporter');
        setTransporters(filtered);
      } catch (err) {
        console.error("Failed to load transporters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransporters();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Fleet...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Transporter Network</h2>
        <p className="text-slate-500 text-sm">Manage and verify your active logistics partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transporters.length > 0 ? (
          transporters.map((t: any) => (
            <div key={t.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-xl">
                  {t.full_name.charAt(0)}
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">
                  Verified
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg">{t.full_name}</h3>
              <p className="text-slate-500 text-sm mb-4">{t.company_name || "Independent Carrier"}</p>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="mr-2">📞</span> {t.phone}
                </div>
                <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                  View Shipments
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No transporters registered in the network yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterNetwork;