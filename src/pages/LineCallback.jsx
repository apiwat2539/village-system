import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const LineCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    // "state" ที่ LINE ส่งกลับมาเป็น one-time use ฝั่ง backend (เซ็นครั้งเดียว/
    // verify ครั้งเดียว) ดังนั้นต้องยิง callback ครั้งเดียวเท่านั้น กัน re-render
    // เรียกซ้ำ (เช่น React StrictMode)
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลยืนยันตัวตนจาก LINE กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      }).then(() => navigate('/', { replace: true }));
      return;
    }

    const handleCallback = async () => {
      try {
        const res = await api.post(ENDPOINTS.AUTH.LINE_CALLBACK, { code, state });
        const body = res.data;

        // state หมดอายุ/ไม่ถูกต้อง - backend ตอบ HTTP 200 พร้อม code "0007"
        // (ไม่ใช่ HTTP error) จึงต้องเช็ค body.code ก่อนเสมอ
        if (body.code === '0007') {
          await Swal.fire({
            title: 'เซสชัน LINE Login หมดอายุ',
            text: 'กรุณาเข้าสู่ระบบด้วย LINE ใหม่อีกครั้ง',
            icon: 'warning',
            confirmButtonText: 'ตกลง'
          });
          navigate('/', { replace: true });
          return;
        }

        const data = body.data || {};

        if (data.status === 'login') {
          await login(data.accessToken, data.refreshToken);
          navigate('/dashboard', { replace: true });
        } else if (data.status === 'pending') {
          await Swal.fire({
            title: 'บัญชีของคุณยังไม่เปิดใช้งาน',
            text: 'กรุณาติดต่อเจ้าหน้าที่นิติบุคคลเพื่ออนุมัติการเข้าใช้งาน',
            icon: 'warning',
            confirmButtonText: 'รับทราบ',
            confirmButtonColor: '#4f46e5'
          });
          navigate('/', { replace: true });
        } else if (data.status === 'register_required') {
          // ส่ง ticket ผ่าน navigation state เท่านั้น (ไม่เก็บ localStorage/URL)
          // เพื่อไม่ให้หลุดค้างอยู่ที่ไหนเกินความจำเป็น
          navigate('/register/line', {
            replace: true,
            state: {
              registrationTicket: data.registrationTicket,
              displayName: data.displayName,
              pictureUrl: data.pictureUrl,
            },
          });
        } else {
          throw new Error(`unexpected status: ${data.status}`);
        }
      } catch (err) {
        console.error('LINE callback error:', err);
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-kanit">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4" />
      <p className="text-slate-500">กำลังตรวจสอบข้อมูลจาก LINE...</p>
    </div>
  );
};

export default LineCallback;
