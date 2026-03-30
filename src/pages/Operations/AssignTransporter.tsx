import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// 1. Added TypeScript Interfaces to fix any potential TS warnings
interface Shipment {
  id: string;
  shipment_code: string;
  pickup_city: string;
  receiver_city: string;
}

interface Transporter {
  id: string;
  company_name: string;
}

const AssignTransporter: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const navigate = useNavigate();
  
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); 

        // 1. Fetch Shipments
        const shipRes = await api.get('/shipments');
        
        if (!Array.isArray(shipRes.data)) {
           throw new Error("Backend did not return a list of shipments.");
        }

        const foundShipment = shipRes.data.find((s: Shipment) => s.id === shipmentId);
        if (!foundShipment) {
           setError("Shipment not found in database.");
        } else {
           setShipment(foundShipment);
        }

        // 2. Fetch Transporters
        const transRes = await api.get('/transporters');
        
        if (Array.isArray(transRes.data)) {
           setTransporters(transRes.data);
        } else {
           console.warn("No transporters found or invalid format.");
           setTransporters([]);
        }

      } catch (err: any) {
        const errMsg = err.response?.data?.detail || err.message || "Failed to load data from server.";
        setError(`Error: ${errMsg}`);
      } finally {
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
    
    // 🚨 THE REAL FIX: Check LocalStorage strictly
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      return setError("Authentication Error: Missing user_id in localStorage. Please log in again.");
    }

    setIsSubmitting(true);
    setError('');

    try {
      const assignmentPayload = {
        shipment_id: shipmentId,
        transporter_id: selectedTransporter,
        assigned_by: userId 
      };
      
      console.log("🚀 SENDING PAYLOAD:", assignmentPayload);

      await api.post('/assignments', assignmentPayload);

      alert("Transporter Assigned Successfully!");
      navigate('/operations'); 
    } catch (err: any) {
      console.error("🔥 BACKEND REJECTED IT:", err.response?.data);
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

      // ... existing code ...

{shipment && (
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
)}
    </div>
  );
};

export default AssignTransporter;