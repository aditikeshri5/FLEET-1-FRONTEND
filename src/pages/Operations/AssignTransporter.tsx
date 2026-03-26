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

  // Fetch initial data
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Ensure loading starts true

        // 1. Fetch Shipments
        const shipRes = await api.get('/shipments');
        
        // 🚨 SAFETY CHECK: Ensure backend returned an array
        if (!Array.isArray(shipRes.data)) {
           throw new Error("Backend did not return a list of shipments.");
        }

        const foundShipment = shipRes.data.find((s: any) => s.id === shipmentId);
        if (!foundShipment) {
           setError("Shipment not found in database.");
        } else {
           setShipment(foundShipment);
        }

        // 2. Fetch Transporters
        const transRes = await api.get('/transporters');
        
        // 🚨 SAFETY CHECK: Ensure backend returned an array
        if (Array.isArray(transRes.data)) {
           setTransporters(transRes.data);
        } else {
           console.warn("No transporters found or invalid format.");
           setTransporters([]);
        }

      } catch (err: any) {
        // 🚨 FIX: Extract the actual error message so you aren't guessing
        const errMsg = err.response?.data?.detail || err.message || "Failed to load data from server.";
        setError(`Error: ${errMsg}`);
        console.error("Fetch Data Error:", err);
      } finally {
        // 🚨 FIX: This MUST run, even if it crashes, to remove the loading screen
        setLoading(false);
      }
    };

    if (shipmentId) fetchData();
  }, [shipmentId]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransporter) return setError("Please select a transporter");
    if (!shipmentId) return setError("Shipment ID is missing");
    
    setIsSubmitting(true);
    setError('');

    const userId = localStorage.getItem('user_id');

    try {
      // 🚨 FIX 1: Send as JSON Body, NOT as params
      const assignmentPayload = {
        shipment_id: shipmentId,
        transporter_id: selectedTransporter,
        assigned_by: userId || ""
      };
      console.log("SENDING THIS TO BACKEND:", assignmentPayload);

      // Ensure the URL exactly matches your backend route (we removed the trailing slash earlier)
      await api.post('/assignments', assignmentPayload);

      // 🚨 FIX 2: Check if your status route also needs a JSON body!
      // I am commenting this out temporarily. If your backend updates the status
      // inside the '/assignments' route (like I showed in my previous code), 
      // you don't need a second API call here!
      
      /*
      const statusPayload = {
        shipment_id: shipmentId,
        status: 'ASSIGNED',
        city: 'Operations Hub',
        updated_by: userId || ""
      };
      await api.post('/status', statusPayload);
      */

      alert("Transporter Assigned Successfully!");
      navigate('/operations'); // Redirect back to operations dashboard
    } catch (err: any) {
      console.error("Assignment Failed:", err);
      // Show the actual error message from the backend if it exists
      setError(err.response?.data?.detail || "Assignment failed. Check console for details.");
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

      {/* Shipment Preview */}
      {shipment && (
        <div className="bg-gray-900 text-white rounded-lg p-6 shadow-md">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Active Shipment</p>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-mono font-bold">{shipment.shipment_code}</h2>
            <p className="text-sm font-medium">
              {shipment.pickup_city} to {shipment.receiver_city}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
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
                {t.company_name || "Private Transporter"}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !selectedTransporter}
            className="w-full py-3 px-6 rounded-md text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md active:scale-[0.98]"
          >
            {isSubmitting ? 'Processing...' : 'Confirm & Lock Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTransporter;