import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    role: 'manufacturer',
    company_name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/signup', formData);

      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('role', formData.role);
      localStorage.setItem('full_name', formData.full_name);

      if (formData.role === 'operations') navigate('/operations');
      else if (formData.role === 'manufacturer') navigate('/manufacturer');
      else if (formData.role === 'transporter') navigate('/transporter');
      else if (formData.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[Inter]">

      {/* HEADER */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-4xl font-extrabold tracking-wider">
          <span className="text-[#1B2A4A]">FLEET</span>
          <span className="text-[#D97706]">1</span>
        </h2>
        <p className="mt-3 text-sm text-gray-500 tracking-wide">
          Create your account
        </p>
      </div>

      {/* CARD */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100 space-y-4"
        >

          <h2 className="text-xl font-semibold text-center text-gray-800">
            Create Account
          </h2>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* FULL NAME */}
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#D97706]"
          />

          {/* PHONE */}
          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#D97706]"
          />

          {/* PASSWORD */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#D97706]">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full p-2 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-[#D97706]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ROLE */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#D97706]"
          >
            <option value="manufacturer">Manufacturer</option>
            <option value="transporter">Transporter</option>
            <option value="operations">Operations</option>
            <option value="admin">Admin</option>
          </select>

          {/* COMPANY */}
          <input
            name="company_name"
            placeholder="Company Name"
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#D97706]"
          />

          {/* ADDRESS */}
          {(formData.role === 'manufacturer' || formData.role === 'transporter') && (
            <div className="space-y-4 pt-2 border-t mt-2">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Operating Address
              </p>

              <input
                name="street"
                placeholder="Street / Area"
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded-lg outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-lg outline-none"
                />
                <input
                  name="state"
                  placeholder="State"
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-lg outline-none"
                />
              </div>

              <input
                name="pincode"
                placeholder="Pincode"
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded-lg outline-none"
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-[#D97706] text-white rounded-lg hover:bg-[#c46a05] disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Signup;