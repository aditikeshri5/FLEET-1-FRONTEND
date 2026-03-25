import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="p-10">Loading users...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Total: {users.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Name</th>
              <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Phone</th>
              <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Role</th>
              <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Company</th>
              <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                <td className="p-4 font-medium text-gray-700">{user.full_name}</td>
                <td className="p-4 text-gray-600">{user.phone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                    user.role === 'manufacturer' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{user.company_name || 'Individual'}</td>
                <td className="p-4">
                  <button className="text-red-500 hover:text-red-700 font-medium text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;