import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = () => {
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        if (!accessToken) {
            Swal.fire({
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'คุณต้องเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้',
                icon: 'warning',
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'ไปหน้า Login'
            });
        }
    }, [accessToken]);

    // ถ้าไม่มี Token ให้ส่งกลับไปหน้า Login
    if (!accessToken) {
        return <Navigate to="/" replace />;
    }

    // ถ้ามี Token ให้แสดงหน้าลูก (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;