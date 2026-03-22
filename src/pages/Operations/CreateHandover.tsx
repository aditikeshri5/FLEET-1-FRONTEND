import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateHandover: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const navigate = useNavigate();
  
  const [shipment, setShipment] = useState<any>(null);
  const [transporters, setTransporters] = useState<any[]>([]);
  
  // Form State
  const [toTransporter, setToTransporter] = useState('');
  const [handoverCity, setHandoverCity] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shipRes = await api.get('/shipments/');
        const foundShipment = shipRes.data.find((s: any) => s.id === shipmentId);
        if (!foundShipment) throw new Error("Shipment not found");
        setShipment(foundShipment);

        const transRes = await api.get('/transporters/');
        setTransporters(transRes.data);
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
    setIsSubmitting(true);
    setError('');

    try {
      // The handover endpoint uses a JSON body
      await api.post('/handovers/', {
        shipment_id: shipmentId,
        from_transporter_id: shipment.current_transporter_id || "00000000-0000-0000-0000-000000000000",
        to_transporter_id: toTransporter,
        handover_city: handoverCity,
        handed_over_by: localStorage.getItem('user_id')
      });

      // Update the status on the timeline
      await api.post('/status/', null, {
        params: {
          shipment_id: shipmentId,
          status: 'handed_over',
          location: handoverCity,
          updated_by: localStorage.getItem('user_id')
        }
      });

      navigate('/operations');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create handover.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the name of the current transporter holding the goods
  const currentTransporter = transporters.find(t => t.id === shipment?.current_transporter_id);

  if (loading) return <div className="p-6">Loading handover protocol...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Execute Logistics Handover</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        
        {/* Read-Only Current State */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
          <p className="text-sm text-gray-500 mb-1">Current Custodian (From)</p>
          <p className="font-semibold text-lg text-gray-900">
            {currentTransporter ? currentTransporter.company_name : 'Unknown or Not Assigned'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Custody To *</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
            value={toTransporter}
            onChange={(e) => setToTransporter(e.target.value)}
            required
          >
            <option value="" disabled>-- Select Receiving Transporter --</option>
            {transporters
              .filter(t => t.id !== shipment?.current_transporter_id) // Don't let them hand over to themselves
              .map(t => (
              <option key={t.id} value={t.id}>{t.company_name} ({t.operating_city})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Handover City / Location *</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g. Jaipur Distribution Hub"
            value={handoverCity}
            onChange={(e) => setHandoverCity(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Execute Handover'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHandover;