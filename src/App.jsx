import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // ใช้จากที่เขียนให้รอบที่แล้ว
import AdminUserManage from './pages/AdminUserManage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import ReportHistory from './pages/ReportHistory';
import Payment from './pages/Payment';
import AdminReportManage from './pages/AdminReportManage';
import AdminAccountManage from './pages/AdminAccountManage';
import AdminPaymentTracking from './pages/AdminPaymentTracking';

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-100">
    <BrowserRouter>
      <Routes>
        {/* หน้าแรกให้เป็น Login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/report-history" element={<ReportHistory />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin-report" element={<AdminReportManage />} />
        <Route path="/admin-account-manage" element={<AdminAccountManage />} />
        <Route path="/admin-user-manage" element={<AdminUserManage />} />
        <Route path="/admin-payment-tracking" element={<AdminPaymentTracking />} />

        {/* ถ้าพิมพ์ URL ผิดให้กลับไปที่หน้า Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}
export default App;