import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    role: 'manufacturer', 
    company_name: '',
    // 👇 NEW DETAILED ADDRESS FIELDS
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', formData);
      alert("Registration Successful!");
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input name="full_name" placeholder="Full Name" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full border p-2 rounded" />

        <select name="role" value={formData.role} onChange={handleChange} className="w-full border p-2 rounded bg-white">
          <option value="manufacturer">Manufacturer</option>
          <option value="transporter">Transporter</option>
          <option value="operations">Operations</option>
          <option value="admin">Admin</option>
        </select>

        <input name="company_name" placeholder="Company Name" onChange={handleChange} required className="w-full border p-2 rounded" />

        {/* 👇 THE FOUR ADDRESS FIELDS (Only for Manu/Trans) 👇 */}
        {(formData.role === 'manufacturer' || formData.role === 'transporter') && (
          <div className="space-y-4 pt-2">
            <p className="text-sm font-semibold text-gray-600 border-b pb-1">Operating Address</p>
            <input name="street" placeholder="Street / Area" onChange={handleChange} required className="w-full border p-2 rounded" />
            
            <div className="grid grid-cols-2 gap-2">
              <input name="city" placeholder="City" onChange={handleChange} required className="border p-2 rounded" />
              <input name="state" placeholder="State" onChange={handleChange} required className="border p-2 rounded" />
            </div>
            
            <input name="pincode" placeholder="Pincode" onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-4">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;