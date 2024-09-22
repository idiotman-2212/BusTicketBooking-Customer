import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
<<<<<<< HEAD
    port: 3000,
    hmr: {
      host: 'chauhuydien.id.vn'
    }
=======
    port: 3000
>>>>>>> 2c868a3 (update ssm)
  }
})
