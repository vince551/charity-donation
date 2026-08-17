import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/charity-donation/',
  plugins: [react()],
  server: { port: 5173 },
  build: { sourcemap: true }
});
