import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/pricing-suggestions': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/reorder-suggestions': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/engine': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/seed': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
