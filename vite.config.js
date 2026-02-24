import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    allowedHosts: [
      '38d5-1-47-152-63.ngrok-free.app',
    ],
    proxy: {
      '/api': {
        // เปลี่ยนจาก localhost เป็น IP ของเครื่องที่รัน Backend ถ้าไม่ใช่เครื่องเดียวกัน
        target: 'http://25.16.201.205:3000', 
        changeOrigin: true,
        secure: false,
        // สำคัญ: ตัด /api ออกก่อนส่งไป Backend
        rewrite: (path) => path.replace(/^\/api/, ''), 
      }
    }
  }
})