import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await api.post('/auth/login', { phone, password });

    if (res.data.role !== 'admin') {
      alert("Unauthorized");
      return;
    }

    localStorage.setItem('role', 'admin');
    navigate('/admin');
  };

  return (
    <div className="center">
      <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Admin Login</button>
    </div>
  );
};

export default AdminLogin;