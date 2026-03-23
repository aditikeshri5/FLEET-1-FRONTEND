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
        // Fetch specific shipment details
        const shipRes = await api.get('/shipments/');
        const foundShipment = shipRes.data.find((s: any) => s.id === shipmentId);
        if (!foundShipment) throw new Error("Shipment not found");
        setShipment(foundShipment);

        // Fetch the list of transporters (now unfiltered from backend)
        const transRes = await api.get('/transporters/');
        setTransporters(transRes.data);
      } catch (err: any) {
        setError("Failed to load data. Check backend connection.");
        console.error(err);
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
      // 1. Post to Assignments Table
      await api.post('/assignments/', null, {
        params: {
          shipment_id: shipmentId,
          transporter_id: selectedTransporter,
          assigned_by: userId
        }
      });

      // 2. Update Shipment Status to 'assigned'
      await api.post('/status/', null, {
        params: {
          shipment_id: shipmentId,
          status: 'assigned',
          city: 'Operations Hub', // Simple string payload
          updated_by: userId
        }
      });

      // Redirect back to dashboard
      navigate('/operations');
    } catch (err: any) {
      console.error(err);
      setError("Assignment failed. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading Network Data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Assign Transporter</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
          &larr; Return to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Shipment Preview Card */}
      {shipment && (
        <div className="bg-gray-900 text-white rounded-lg p-6 shadow-md">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Active Shipment</p>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-mono font-bold">{shipment.shipment_code}</h2>
            <p className="text-sm font-medium">{shipment.pickup_city} to {shipment.receiver_city}</p>
          </div>
        </div>
      )}

      {/* Selection Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose Transport Company
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 outline-none"
            value={selectedTransporter}
            onChange={(e) => setSelectedTransporter(e.target.value)}
            required
          >
            <option value="" disabled>-- Select Verified Transporter --</option>
            {transporters.map(t => (
              <option key={t.id} value={t.id}>
                {/* JUST THE COMPANY NAME AS REQUESTED */}
                {t.company_name || "Private Transporter"}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !selectedTransporter}
            className="w-full py-3 px-6 rounded-md text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Confirm & Lock Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTransporter;