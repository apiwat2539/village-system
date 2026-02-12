import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '', lineId: '', houseNo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ลงทะเบียนรอ Admin Approve:", formData);
    alert("ลงทะเบียนสำเร็จ! กรุณารอ Admin อนุมัติการเข้าใช้งาน");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">ลงทะเบียนสมาชิกใหม่</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="ชื่อจริง" className="border p-2 rounded" onChange={e => setFormData({...formData, firstName: e.target.value})} required />
          <input type="text" placeholder="นามสกุล" className="border p-2 rounded" onChange={e => setFormData({...formData, lastName: e.target.value})} required />
        </div>
        <input type="text" placeholder="Username" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({...formData, username: e.target.value})} required />
        <input type="password" placeholder="Password" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <input type="text" placeholder="Line ID (สำหรับแจ้งเตือน)" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({...formData, lineId: e.target.value})} required />
        <input type="text" placeholder="บ้านเลขที่ (เช่น 99/1)" className="w-full border p-2 mb-6 rounded" onChange={e => setFormData({...formData, houseNo: e.target.value})} required />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">ส่งข้อมูลลงทะเบียน</button>
        <p className="text-center mt-4 text-sm text-gray-600">เป็นสมาชิกอยู่แล้ว? <Link to="/" className="text-indigo-600 font-bold hover:underline">เข้าสู่ระบบ</Link></p>
      </form>
    </div>
  );
};
export default Register;