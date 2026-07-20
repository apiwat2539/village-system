import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';
import LineLoginButton from '../components/LineLoginButton';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    lineId: '',
    houseNo: '',
    mobileNo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'กำลังลงทะเบียน...',
      text: 'กรุณารอสักครู่ ระบบกำลังส่งข้อมูลการลงทะเบียน',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let resp = await api.post(ENDPOINTS.AUTH.REGISTER, {
        firstname: formData.firstName,
        lastname: formData.lastName,
        username: formData.username,
        password: formData.password,
        lineId: formData.lineId,
        houseNo: formData.houseNo,
        mobileNo: formData.mobileNo
      });

      if (resp.data.code === "0005") {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'Username นี้ถูกใช้งานแล้ว',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        return;
      }

      Swal.fire({
        title: 'ลงทะเบียนสำเร็จ',
        text: 'กรุณารอ Admin อนุมัติการเข้าใช้งาน',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        navigate('/'); // Redirect to Login page
      });
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง';
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">ลงทะเบียนสมาชิกใหม่</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="ชื่อจริง" className="border p-2 rounded" onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
          <input type="text" placeholder="นามสกุล" className="border p-2 rounded" onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
        </div>
        <input type="text" placeholder="Username" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({ ...formData, username: e.target.value })} required />
        <input type="password" placeholder="Password" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({ ...formData, password: e.target.value })} required />
        <input type="text" placeholder="Line ID (สำหรับแจ้งเตือน)" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({ ...formData, lineId: e.target.value })} required />
        <input type="tel" placeholder="เบอร์โทรศัพท์ (Mobile No)" className="w-full border p-2 mb-4 rounded" onChange={e => setFormData({ ...formData, mobileNo: e.target.value })} required />
        <input type="text" placeholder="บ้านเลขที่ (เช่น 99/1)" className="w-full border p-2 mb-6 rounded" onChange={e => setFormData({ ...formData, houseNo: e.target.value })} required />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">ส่งข้อมูลลงทะเบียน</button>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-3 text-xs text-slate-400 font-bold">หรือ</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <LineLoginButton label="ลงทะเบียน/เข้าสู่ระบบด้วย LINE" />

        <p className="text-center mt-4 text-sm text-gray-600">เป็นสมาชิกอยู่แล้ว? <Link to="/" className="text-indigo-600 font-bold hover:underline">เข้าสู่ระบบ</Link></p>
      </form>
    </div>
  );
};
export default Register;