import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      // API volání
      '/api': {
        target: 'http://is_backend_c:8000',
        changeOrigin: true,
      },
      // Obrázky a statika
      '/static': {
        target: 'http://is_backend_c:8000',
        changeOrigin: true,
        // pokud by backend servíroval statiku jinde, můžete rewrite použít
        // rewrite: path => path.replace(/^\/static/, '/static')
      },
      // pokud byste chtěli samostatně media složky
      '/media': {
        target: 'http://is_backend_c:8000',
        changeOrigin: true,
      },
    },
  },
})
