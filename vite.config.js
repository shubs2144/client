// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/merlin-proxy': {
        target: 'https://arcane.getmerlin.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/merlin-proxy/, '')
      },
      '/jsdelivr-proxy': {
        target: 'https://cdn.jsdelivr.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jsdelivr-proxy/, '')
      }
    }
  }
})