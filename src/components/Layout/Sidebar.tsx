import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Define navigation links based on user role
  const navLinks = {
    manufacturer: [
      { name: 'Dashboard', path: '/manufacturer' },
      { name: 'All Shipments', path: '/manufacturer/shipments' },
      { name: 'Create Shipment', path: '/manufacturer/shipments/new' },
    ],
    transporter: [
      { name: 'Dashboard', path: '/transporter' },
    ],
    operations: [
      { name: 'Dashboard', path: '/operations' },
    ],
    admin: [
      { name: 'User Management', path: '/admin' },
      { name: 'Transporters', path: '/admin/transporters' },
    ],
  };

  const links = navLinks[user.role as keyof typeof navLinks] || [];

  return (
    <div className="w-60 bg-[#1B2A4A] text-white flex flex-col h-full shadow-lg">
      <div className="p-6 text-2xl font-bold tracking-wider border-b border-gray-700">
        <span className="text-[#D97706]">FLEET</span>-1
      </div>
      <nav className="flex-1 mt-6">
        <ul>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path} className="px-4 py-2">
                <Link
                  to={link.path}
                  className={`block px-4 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-[#D97706] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        Logged in as:<br/>
        <span className="font-semibold text-white">{user.full_name}</span>
      </div>
    </div>
  );
};

export default Sidebar;