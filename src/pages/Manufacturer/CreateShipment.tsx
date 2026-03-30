import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Added to show errors on screen

  const [formData, setFormData] = useState({
    pickup_address: '',
    pickup_city: '',
    pickup_pincode: '',
    pickup_contact: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    receiver_city: '',
    receiver_pincode: '',
    goods_description: '',
    quantity: 1,           
    weight: '',            
    shipment_code: '',     
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          const response = await api.get(`/auth/profile/${userId}`);
          setProfileData(response.data);
        }
      } catch (err) {
        console.error("Could not fetch profile for auto-fill", err);
      }
    };
    fetchProfile();
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseDefaultAddress(checked);

    if (checked && profileData) {
      setFormData(prev => ({
        ...prev,
        pickup_address: profileData.street || '',
        pickup_city: profileData.city || '',
        pickup_pincode: profileData.pincode || '',
        pickup_contact: profileData.full_name || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        pickup_address: '',
        pickup_city: '',
        pickup_pincode: '',
        pickup_contact: '',
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(''); // clear previous errors

    try {
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        setIsSubmitting(false);
        return setErrorMsg("Authentication Error: Missing user_id in localStorage. Please log in again.");
      }

      // 🚨 FIX: Auto-generate a dummy shipment code if the user didn't type one,
      // just in case your backend database requires it!
      const generatedCode = formData.shipment_code || `SHP-${Math.floor(Math.random() * 100000)}`;

      const submissionData = {
        ...formData,
        shipment_code: generatedCode, 
        manufacturer_id: userId,
        weight: parseFloat(formData.weight.toString()) || 0,
        quantity: parseInt(formData.quantity.toString()) || 1,
      };

      console.log("🚀 SENDING PAYLOAD:", submissionData);

      // Make sure this route perfectly matches your FastAPI @router.post("")
      await api.post('/shipments/create', submissionData); 
      
      alert("Shipment Created Successfully!");
      navigate('/manufacturer'); 
    } catch (err: any) {
      // 🚨 THE ULTIMATE DEBUG LINES 🚨
      console.error("🔥 BACKEND REJECTED IT:", err.response?.data);
      
      // Show the error on the screen so you don't have to guess
      const backendError = err.response?.data?.detail;
      setErrorMsg(
        typeof backendError === 'string' 
          ? backendError 
          : JSON.stringify(backendError) || "Network error. Check console."
      );
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gray-900 p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Create New Shipment</h1>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition">← Back</button>
        </div>

        {/* 🚨 Added Error Display Banner */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 m-8 mb-0 rounded-md border border-red-200 font-mono text-sm">
            ERROR: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* Section 1: Pickup Information */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold text-gray-700">Pickup Information</h2>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={useDefaultAddress} 
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-800 transition">Use my registered address</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Pickup Address *</label>
                <input name="pickup_address" value={formData.pickup_address} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none transition" placeholder="Street Name / Factory Area" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Pickup City *</label>
                  <input name="pickup_city" value={formData.pickup_city} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Pickup Pincode *</label>
                  <input name="pickup_pincode" value={formData.pickup_pincode} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" placeholder="e.g. 302026" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Contact Person *</label>
                  <input name="pickup_contact" value={formData.pickup_contact} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Receiver Information */}
          <div className="space-y-6 mt-10">
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Receiver Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Receiver Name *</label>
                <input name="receiver_name" value={formData.receiver_name} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Receiver Phone *</label>
                <input name="receiver_phone" value={formData.receiver_phone} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-600 mb-1">Receiver Full Address *</label>
              <input name="receiver_address" value={formData.receiver_address} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Receiver City *</label>
                <input name="receiver_city" value={formData.receiver_city} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Receiver Pincode *</label>
                <input name="receiver_pincode" value={formData.receiver_pincode} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" placeholder="e.g. 110001" />
              </div>
            </div>
          </div>

          {/* Section 3: Shipment Details */}
          <div className="space-y-6 mt-10">
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Shipment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Goods Description *</label>
                <input name="goods_description" value={formData.goods_description} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" placeholder="e.g. Electronics, Textiles" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Quantity (Boxes/Items) *</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-600 mb-1">Total Weight (kg) *</label>
                <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} required className="border-2 border-gray-100 p-2 rounded focus:border-blue-500 outline-none" placeholder="e.g. 250.5" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-8 bg-blue-600 text-white py-4 rounded-lg font-extrabold text-lg hover:bg-blue-700 transition shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Shipment...' : 'Finalize Shipment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;