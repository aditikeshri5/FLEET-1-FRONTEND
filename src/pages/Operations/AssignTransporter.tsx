import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AssignTransporter: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const navigate = useNavigate();
  
  const [shipment, setShipment] = useState<any>(null);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Shipment details (filter client-side since no specific endpoint exists)
        const shipRes = await api.get('/shipments/');
        const foundShipment = shipRes.data.find((s: any) => s.id === shipmentId);
        if (!foundShipment) throw new Error("Shipment not found");
        setShipment(foundShipment);

        // 2. Fetch all transporters for the dropdown
        const transRes = await api.get('/transporters/');
        // Filter out inactive ones just to be safe
        setTransporters(transRes.data.filter((t: any) => t.is_active !== false));
      } catch (err: any) {
        setError("Failed to load data. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (shipmentId) fetchData();
  }, [shipmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransporter) return setError("Please select a transporter");
    
    setIsSubmitting(true);
    setError('');

    const userId = localStorage.getItem('user_id');

    try {
      // 1. Call the Assignment API (Uses Query Params!)
      await api.post('/assignments/', null, {
        params: {
          shipment_id: shipmentId,
          transporter_id: selectedTransporter,
          assigned_by: userId
        }
      });

      // 2. Sneaky Frontend Hack: Force the status to 'assigned' because the backend forgot to!
      await api.post('/status/', null, {
        params: {
          shipment_id: shipmentId,
          status: 'assigned',
          location: 'Operations Hub',
          updated_by: userId
        }
      });

      // Kick back to dashboard on success
      navigate('/operations');
    } catch (err: any) {
      console.error(err);
      setError("Failed to assign transporter. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading assignment terminal...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Assign Transporter</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">{error}</div>}

      {/* Shipment Summary Card */}
      {shipment && (
        <div className="bg-[#1B2A4A] text-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm text-gray-300 uppercase tracking-wider font-bold mb-4">Shipment Target</h3>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold mb-1">{shipment.shipment_code}</p>
              <p className="text-gray-300">{shipment.pickup_city} &rarr; {shipment.receiver_city}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Package</p>
              <p className="font-semibold">{shipment.quantity} units, {shipment.weight}kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Transport Company</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] bg-white text-gray-900"
            value={selectedTransporter}
            onChange={(e) => setSelectedTransporter(e.target.value)}
            required
          >
            <option value="" disabled>-- Choose a Transporter from the Network --</option>
            {transporters.map(t => (
              <option key={t.id} value={t.id}>
                {t.company_name} (Operating in: {t.operating_city})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting || !selectedTransporter}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Assigning...' : 'Lock Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTransporter;