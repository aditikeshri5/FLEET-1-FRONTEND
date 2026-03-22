import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State matching the ShipmentCreate schema
  const [formData, setFormData] = useState({
    pickup_address: '',
    pickup_city: '',
    pickup_contact: '',
    receiver_name: '',
    receiver_address: '',
    receiver_city: '',
    receiver_phone: '',
    goods_description: '',
    quantity: '',
    weight: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const manufacturerId = localStorage.getItem('user_id');

    if (!manufacturerId) {
      setError('Error: Manufacturer ID missing from session. Please log out and back in.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Format the payload exactly as the backend expects
      const payload = {
        pickup_address: formData.pickup_address,
        pickup_city: formData.pickup_city,
        pickup_contact: formData.pickup_contact,
        receiver_name: formData.receiver_name,
        receiver_address: formData.receiver_address,
        receiver_city: formData.receiver_city,
        receiver_phone: formData.receiver_phone,
        goods_description: formData.goods_description || "N/A", 
        quantity: parseInt(formData.quantity) || 1, 
        weight: parseFloat(formData.weight) || 1.0, 
        manufacturer_id: manufacturerId,
        shipment_code: `SHP-${Math.floor(Math.random() * 10000)}` // Forcing a string here just in case FastAPI is being strict
      };

      console.log("SENDING PAYLOAD TO BACKEND:", payload);

      await api.post('/shipments/', payload);
      
      // On success, kick them back to the list
      navigate('/manufacturer/shipments');
    } catch (err: any) {
      console.error("FULL BACKEND ERROR:", err.response?.data);
      
      // BULLETPROOF ERROR PARSING - Guaranteed to never crash React again
      const detail = err.response?.data?.detail;
      
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        const badField = detail[0]?.loc?.[detail[0]?.loc?.length - 1] || 'unknown field';
        setError(`Backend rejected "${badField}": ${detail[0]?.msg}`);
      } else if (detail && typeof detail === 'object') {
        // If it's an object, stringify it so React can actually print it
        setError(JSON.stringify(detail));
      } else {
        setError(err.message || 'Failed to create shipment. Check your inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 font-mono text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-8">
        
        {/* Origin / Pickup Details */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-[#1B2A4A] mb-4">Pickup Information</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Pickup Address *</label>
              <input type="text" name="pickup_address" required value={formData.pickup_address} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup City *</label>
              <input type="text" name="pickup_city" required value={formData.pickup_city} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact at Pickup *</label>
              <input type="text" name="pickup_contact" required value={formData.pickup_contact} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Destination / Receiver Details */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-[#1B2A4A] mb-4">Receiver Information</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Receiver Name *</label>
              <input type="text" name="receiver_name" required value={formData.receiver_name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Receiver Phone *</label>
              <input type="text" name="receiver_phone" required value={formData.receiver_phone} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Receiver Address *</label>
              <input type="text" name="receiver_address" required value={formData.receiver_address} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Receiver City *</label>
              <input type="text" name="receiver_city" required value={formData.receiver_city} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Goods Details */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-[#1B2A4A] mb-4">Package Details</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Goods Description</label>
              <textarea name="goods_description" rows={2} value={formData.goods_description} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity (Units) *</label>
              <input type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
              <input type="number" step="0.1" min="0.1" name="weight" required value={formData.weight} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#D97706] focus:border-[#D97706] sm:text-sm border p-2" />
            </div>
          </div>
        </div>

        <div className="pt-5 flex justify-end">
          <button type="button" onClick={() => navigate(-1)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D97706] mr-3">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#D97706] hover:bg-[#b46205] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D97706] disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Create Shipment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;