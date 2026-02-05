import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['pdfjs-dist']
    },
    server: {
        port: 3000,
        proxy: {
            '/api/finance': {
                target: 'http://localhost:4001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/finance/, '')
            },
            '/api/habit': {
                target: 'http://localhost:4002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/habit/, '')
            },
            '/api/health': {
                target: 'http://localhost:4003',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/health/, '')
            }
        }
    }
})
