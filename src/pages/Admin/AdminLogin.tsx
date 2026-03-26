import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        phone,
        password,
      });

      const user = response.data;

      // ✅ Check role strictly
      if (user.role !== 'admin') {
        setError('Access denied: Not an Admin');
        setIsSubmitting(false);
        return;
      }

      // ✅ Store data
      localStorage.setItem('user_id', user.user_id);
      localStorage.setItem('role', user.role);
      localStorage.setItem('full_name', user.full_name);

      // ✅ Redirect
      navigate('/admin/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">

        <h2 className="text-2xl font-bold text-center">Admin Login</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />

        <div className="flex items-center border rounded-lg px-3">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 outline-none"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {isSubmitting ? 'Logging in...' : 'Login as Admin'}
        </button>

      </form>
    </div>
  );
};

export default AdminLogin;