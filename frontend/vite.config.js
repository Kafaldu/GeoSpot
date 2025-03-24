import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log("Vite Environment Variables:", process.env);

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
