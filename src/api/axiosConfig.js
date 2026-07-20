import axios from 'axios';
import Swal from 'sweetalert2';
import { BASE_URL, ENDPOINTS } from './endpoints';

const api = axios.create({
    baseURL: BASE_URL, // Host ของคุณ
});

// --- 1. Request Interceptor: แนบ Access Token ทุกครั้งที่ยิง API ---
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// --- 2. Response Interceptor: ดัก Error เพื่อทำ Retry / Refresh Token ---
api.interceptors.response.use(
    (response) => response, // ถ้า Status 200 ปกติ ให้ผ่านไปได้
    async (error) => {
        const originalRequest = error.config;

        // ถ้าเจอ Error 401 และยังไม่ได้เคย Retry (เพื่อกัน Loop)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                // ยิงเส้น /refresh-token
                const res = await axios.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
                    refresh_token: refreshToken
                });

                if (res.status === 200) {
                    const newAccessToken = res.data.access_token;
                    localStorage.setItem('accessToken', newAccessToken);

                    // อัปเดต Header ใน Request เดิม แล้วยิงใหม่ (Retry)
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // ถ้า Refresh Token ก็ยังเน่า หรือ Error
                localStorage.clear();
                Swal.fire({
                    title: 'เซสชันหมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    window.location.href = '/'; // ส่งกลับหน้า Login
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;