import React from 'react'; // อย่าลืม import React
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages (ตามที่คุณเขียนไว้)
import Login from './pages/Login';
import Register from './pages/Register';
import LineCallback from './pages/LineCallback';
import RegisterLine from './pages/RegisterLine';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import ReportHistory from './pages/ReportHistory';
import Payment from './pages/Payment';
import AdminReportManage from './pages/AdminReportManage';
import AdminAccountManage from './pages/AdminAccountManage';
import AdminUserManage from './pages/AdminUserManage';
import AdminPaymentTracking from './pages/AdminPaymentTracking';
import AdminFeeConfig from './pages/AdminFeeConfig';
import AdminFinanceOverview from './pages/AdminFinanceOverview';
import PrintInvoice from './pages/PrintInvoice';
import PrintReceipt from './pages/PrintReceipt';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-100 font-kanit">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* 🔓 Public Routes: เข้าได้ทุกคน */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* redirect_uri ต้องตรงกับ line.login.redirect_uri ใน backend config.yaml */}
            <Route path="/auth/line/callback" element={<LineCallback />} />
            <Route path="/register/line" element={<RegisterLine />} />

            {/* 🔒 Protected Routes: ต้องมี Token เท่านั้น */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/report-history" element={<ReportHistory />} />
              <Route path="/payment" element={<Payment />} />

              {/* 🔐 Admin Routes: ต้องมี role admin เท่านั้น */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-report" element={<AdminReportManage />} />
                <Route path="/admin-account-manage" element={<AdminAccountManage />} />
                <Route path="/admin-user-manage" element={<AdminUserManage />} />
                <Route path="/admin-payment-tracking" element={<AdminPaymentTracking />} />
                <Route path="/admin-fee-config" element={<AdminFeeConfig />} />
                <Route path="/admin-finance-overview" element={<AdminFinanceOverview />} />
                <Route path="/admin-invoice/:billId" element={<PrintInvoice />} />
                <Route path="/admin-receipt/:paymentId" element={<PrintReceipt />} />
              </Route>
            </Route>

            {/* 404 - ไม่พบหน้า */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;