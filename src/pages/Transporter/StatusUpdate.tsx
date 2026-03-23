import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const StatusUpdate: React.FC = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState('in_transit');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 100% clean API call, using 'city' instead of 'location'
      await api.post('/status/', null, {
        params: {
          shipment_id: shipmentId,
          status: status,
          city: city, 
          updated_by: localStorage.getItem('user_id')
        }
      });

      // Route back to the dashboard after updating
      navigate('/transporter');
    } catch (err: any) {
      console.error(err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Update Tracking Status</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-[#D97706] hover:text-[#b46205] font-medium">
          &larr; Back
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Status *</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="picked_up">Picked Up (Origin)</option>
            <option value="in_transit">In Transit (On the road)</option>
            <option value="arrived_at_hub">Arrived at Hub (Facility)</option>
            <option value="handed_over">Handed Over (Transfer)</option>
            <option value="delivered">Delivered (Destination)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current City / Location *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706]"
            placeholder="e.g. New Delhi Checkpoint"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Driver Notes (Optional)</label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706]"
            placeholder="Any delays, weather issues, or delivery notes?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#D97706] hover:bg-[#b46205] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D97706] disabled:opacity-50"
          >
            {isSubmitting ? 'Pushing Update...' : 'Update Tracking System'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdate;