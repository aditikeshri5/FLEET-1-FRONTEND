import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Manufacturer Pages
import ManufacturerDashboard from './pages/Manufacturer/ManufacturerDashboard';
import ShipmentList from './pages/Manufacturer/ShipmentList';
import CreateShipment from './pages/Manufacturer/CreateShipment';
import ShipmentDetail from './pages/Manufacturer/ShipmentDetail';

// Transporter Pages
import TransporterDashboard from './pages/Transporter/TransporterDashboard';
import StatusUpdate from './pages/Transporter/StatusUpdate';

// Operations Pages
import OperationsDashboard from './pages/Operations/OperationsDashboard';
import AssignTransporter from './pages/Operations/AssignTransporter';
import CreateHandover from './pages/Operations/CreateHandover';

// Admin Pages
import UserManagement from './pages/Admin/UserManagement';
import TransporterNetwork from './pages/Admin/TransporterNetwork';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes Wrapped in Layout */}
          <Route element={<Layout />}>
            
            {/* Manufacturer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['manufacturer']} />}>
              <Route path="/manufacturer" element={<ManufacturerDashboard />} />
              <Route path="/manufacturer/shipments" element={<ShipmentList />} />
              <Route path="/manufacturer/shipments/new" element={<CreateShipment />} />
              <Route path="/manufacturer/shipments/:id" element={<ShipmentDetail />} />
            </Route>

            {/* Transporter Routes */}
            <Route element={<ProtectedRoute allowedRoles={['transporter']} />}>
              <Route path="/transporter" element={<TransporterDashboard />} />
              <Route path="/transporter/shipments/:id" element={<StatusUpdate />} />
            </Route>

            {/* Operations Routes */}
            <Route element={<ProtectedRoute allowedRoles={['operations']} />}>
              <Route path="/operations" element={<OperationsDashboard />} />
              <Route path="/operations/assign/:shipmentId" element={<AssignTransporter />} />
              <Route path="/operations/handover/:shipmentId" element={<CreateHandover />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<UserManagement />} />
              <Route path="/admin/transporters" element={<TransporterNetwork />} />
            </Route>

          </Route>

          {/* Fallback for 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;