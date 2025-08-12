import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0', // 👈 exposes to your phone on the same network
    port: 5173,      // optional: keep default port
    strictPort: true, // fail if port 5173 is busy (optional)
    proxy: {
      '/api': {
        target: 'https://jabumarket.com.ng',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}))
