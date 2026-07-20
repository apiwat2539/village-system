import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import LineLoginButton from '../components/LineLoginButton';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
      const data = response.data;

      if (data.code === "0004") {
        // 🚨 กรณี User Not Active
        Swal.fire({
          title: 'บัญชีของคุณยังไม่เปิดใช้งาน',
          text: 'กรุณาติดต่อเจ้าหน้าที่นิติบุคคลเพื่ออนุมัติการเข้าใช้งาน',
          icon: 'warning',
          confirmButtonText: 'รับทราบ',
          confirmButtonColor: '#4f46e5', // สี Indigo-600
          showClass: { popup: 'animate__animated animate__fadeInDown' },
          hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
        return; // หยุดการทำงาน ไม่ให้ไปหน้า Dashboard
      }

      // ✅ เก็บ Token ที่ได้จาก API
      await login(data.data.accessToken, data.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      // ❌ กรณี HTTP Status อื่นๆ (400, 401, 500) หรือเชื่อมต่อเซิร์ฟเวอร์ไม่ได้
      setError(err.response?.data?.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-kanit">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-indigo-700">T Primo Village</h2>
          <p className="text-slate-500 mt-2">ยินดีต้อนรับเข้าสู่ระบบจัดการหมู่บ้านโครงการ T Primo</p>
        </div>

        {/* แสดงข้อความ Error ถ้ามี */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="กรอกชื่อผู้ใช้งาน"
              value={credentials.username}
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่าน (Password)</label>
            <input
              type="password"
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="กรอกรหัสผ่าน"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl mt-8 font-black transition-all shadow-lg shadow-indigo-100 ${loading
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
        >
          {loading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-3 text-xs text-slate-400 font-bold">หรือ</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <LineLoginButton label="เข้าสู่ระบบด้วย LINE" />

        <p className="text-center mt-6 text-sm text-slate-500">
          ยังไม่ได้ลงทะเบียน? <Link to="/register" className="text-indigo-600 font-black hover:underline">สมัครสมาชิกที่นี่</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;