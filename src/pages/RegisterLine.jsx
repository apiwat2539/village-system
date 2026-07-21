import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const RegisterLine = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registrationTicket, displayName, pictureUrl } = location.state || {};

  // LINE ส่ง displayName มาเป็นชื่อเต็มก้อนเดียว ไม่แยก first/last ให้
  // เดาแบบง่าย ๆ โดยตัดคำแรกเป็นชื่อ ที่เหลือเป็นนามสกุล ผู้ใช้แก้เองได้
  const splitDisplayName = (name) => {
    if (!name) return { firstName: '', lastName: '' };
    const [firstName, ...rest] = name.trim().split(/\s+/);
    return { firstName, lastName: rest.join(' ') };
  };

  const [formData, setFormData] = useState(() => ({
    ...splitDisplayName(displayName),
    username: '',
    houseNo: '',
    mobileNo: ''
  }));

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
      const res = await api.post(ENDPOINTS.AUTH.LINE_REGISTER, {
        registrationTicket,
        firstname: formData.firstName,
        lastname: formData.lastName,
        username: formData.username,
        houseNo: formData.houseNo,
        mobileNo: formData.mobileNo,
      });

      const body = res.data;

      // ทั้งสองเคสนี้ backend ตอบ HTTP 200 พร้อม code error - เช็คก่อนเสมอ
      if (body.code === '0008') {
        await Swal.fire({
          title: 'เซสชันหมดอายุ',
          text: 'ticket การลงทะเบียนหมดอายุ กรุณาเข้าสู่ระบบด้วย LINE ใหม่อีกครั้ง',
          icon: 'warning',
          confirmButtonText: 'ตกลง'
        });
        navigate('/', { replace: true });
        return;
      }

      if (body.code === '0005') {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'Username นี้ถูกใช้งานแล้ว หรือบัญชี LINE นี้ลงทะเบียนไปแล้ว',
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
        navigate('/', { replace: true });
      });
    } catch (err) {
      console.error('LINE registration error:', err);
      const errorMessage = err.response?.data?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง';
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // ไม่มี registrationTicket แปลว่าเข้าหน้านี้ตรงๆ หรือ refresh แล้วค่าหาย
  // (ticket ส่งผ่าน navigation state เท่านั้น ไม่ persist ข้าม reload)
  if (!registrationTicket) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-kanit">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">เซสชันหมดอายุ</h2>
          <p className="text-slate-500 mb-6">กรุณาเข้าสู่ระบบด้วย LINE ใหม่อีกครั้งเพื่อลงทะเบียน</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700">
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-kanit">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          {pictureUrl && (
            <img
              src={pictureUrl}
              alt="LINE profile"
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-[#06C755]"
            />
          )}
          <h2 className="text-2xl font-bold text-indigo-700">ลงทะเบียนด้วย LINE</h2>
          {displayName && <p className="text-sm text-slate-500 mt-1">เชื่อมต่อบัญชี LINE: {displayName}</p>}
          <p className="text-xs text-slate-400 mt-2">กรอกข้อมูลเพิ่มเติมเพื่อผูกบัญชี LINE นี้กับบ้านของคุณ (ไม่ต้องตั้งรหัสผ่าน)</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="ชื่อจริง"
            className="border p-2 rounded"
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="นามสกุล"
            className="border p-2 rounded"
            value={formData.lastName}
            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 mb-4 rounded"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="เบอร์โทรศัพท์ (Mobile No)"
          className="w-full border p-2 mb-4 rounded"
          value={formData.mobileNo}
          onChange={e => setFormData({ ...formData, mobileNo: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="บ้านเลขที่ (เช่น 99/1)"
          className="w-full border p-2 mb-6 rounded"
          value={formData.houseNo}
          onChange={e => setFormData({ ...formData, houseNo: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          ส่งข้อมูลลงทะเบียน
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          เป็นสมาชิกอยู่แล้ว? <Link to="/" className="text-indigo-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterLine;
