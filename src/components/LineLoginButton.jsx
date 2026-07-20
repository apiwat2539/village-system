import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

// ปุ่มเดียวใช้ได้ทั้งหน้า Login และ Register - backend แยกเองว่าเป็นผู้ใช้เดิม
// (status "login"/"pending") หรือรายใหม่ (status "register_required") จาก LINE profile
// ที่ /auth/line/callback ดังนั้นไม่ต้องมีปุ่ม "login ด้วย LINE" กับ "สมัครด้วย LINE" แยกกัน
const LineLoginButton = ({ label = 'เข้าสู่ระบบด้วย LINE' }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.AUTH.LINE_LOGIN_URL);
      const authorizeUrl = res.data?.data?.authorizeUrl;
      if (!authorizeUrl) {
        throw new Error('missing authorizeUrl in response');
      }
      window.location.href = authorizeUrl;
    } catch (err) {
      console.error('LINE login url error:', err);
      setLoading(false);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อ LINE Login ได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2 ${
        loading
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-[#06C755] text-white hover:bg-[#05b34c] active:scale-95'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 5.94 2 10.7c0 4.27 3.58 7.86 8.41 8.55.33.07.77.22.88.5.1.26.07.66.03.92l-.14.87c-.04.26-.2 1.01.89.55 1.08-.46 5.85-3.45 7.98-5.9C21.68 13.9 22 12.35 22 10.7 22 5.94 17.52 2 12 2z" />
      </svg>
      {loading ? 'กำลังเชื่อมต่อ...' : label}
    </button>
  );
};

export default LineLoginButton;
