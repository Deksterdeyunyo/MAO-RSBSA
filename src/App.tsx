/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Setup } from './pages/Setup';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Recipients } from './pages/Recipients';
import { Distribution } from './pages/Distribution';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="seeds" element={<Inventory type="seeds" title="Seeds Inventory" />} />
            <Route path="fertilizers" element={<Inventory type="fertilizers" title="Fertilizers Inventory" />} />
            <Route path="vet-chemicals" element={<Inventory type="vet_chemicals" title="Vet & Chemicals Inventory" />} />
            <Route path="pesticides" element={<Inventory type="pesticides" title="Pesticides Inventory" />} />
            <Route path="recipients" element={<Recipients />} />
            <Route path="distribution" element={<Distribution />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
