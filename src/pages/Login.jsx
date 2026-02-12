import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("เข้าสู่ระบบด้วย:", credentials);
    // ในอนาคตจะเชื่อมต่อ API ตรงนี้
    // ถ้าสำเร็จ ให้ไปหน้า Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">เข้าสู่ระบบ</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="กรอกชื่อผู้ใช้งาน"
              onChange={e => setCredentials({...credentials, username: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="กรอกรหัสผ่าน"
              onChange={e => setCredentials({...credentials, password: e.target.value})}
              required 
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-6 hover:bg-indigo-700 transition font-semibold">
          เข้าสู่ระบบ
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          ยังไม่ได้ลงทะเบียน? <Link to="/register" className="text-indigo-600 font-bold hover:underline">สมัครสมาชิกที่นี่</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;