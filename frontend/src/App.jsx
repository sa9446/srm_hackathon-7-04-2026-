import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import LoansPage   from './pages/LoansPage';
import InsurancePage from './pages/InsurancePage';
import SettingsPage  from './pages/SettingsPage';

const PrivateRoute = ({ children }) =>
  localStorage.getItem('gig_token') ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/history"   element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="/loans"     element={<PrivateRoute><LoansPage /></PrivateRoute>} />
        <Route path="/insurance" element={<PrivateRoute><InsurancePage /></PrivateRoute>} />
        <Route path="/settings"  element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
