import React from 'react'; // อย่าลืม import React
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages (ตามที่คุณเขียนไว้)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import ReportHistory from './pages/ReportHistory';
import Payment from './pages/Payment';
import AdminReportManage from './pages/AdminReportManage';
import AdminAccountManage from './pages/AdminAccountManage';
import AdminUserManage from './pages/AdminUserManage';
import AdminPaymentTracking from './pages/AdminPaymentTracking';

function App() {
  return (
    // กำหนดฟอนต์หลักที่นี่ (เช่น font-kanit ถ้าคุณติดตั้งไว้)
    <div className="min-h-screen w-full bg-gray-50 font-kanit">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User & Admin Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/report-history" element={<ReportHistory />} />
          <Route path="/payment" element={<Payment />} />
          
          {/* Admin Specific Routes */}
          <Route path="/admin-report" element={<AdminReportManage />} />
          <Route path="/admin-account-manage" element={<AdminAccountManage />} />
          <Route path="/admin-user-manage" element={<AdminUserManage />} />
          <Route path="/admin-payment-tracking" element={<AdminPaymentTracking />} />

          {/* Catch All - ถ้าพิมพ์ URL ผิดให้กลับไปที่หน้า Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;