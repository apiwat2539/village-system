import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // เพิ่มบรรทัดนี้

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // เพิ่มบรรทッドนี้ลงในอาร์เรย์ plugins
  ],
  server: {
    allowedHosts: ['divorcee-outgrow-kinship.ngrok-free.dev'],
    // ให้ dev server proxy /api ไปหา backend ที่รันอยู่ localhost:1323 เอง —
    // ไม่ว่าจะเปิดผ่าน localhost หรือแชร์ port ผ่าน ngrok tunnel เดียว browser
    // ก็ยิง /api แบบ relative (origin เดียวกันเสมอ) ไม่ต้องเปิด tunnel ที่สอง
    // สำหรับ backend และไม่ต้องพึ่ง CORS สำหรับ path นี้เลย
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:1323',
    //     changeOrigin: true,
    //   },
    // },
  },
})