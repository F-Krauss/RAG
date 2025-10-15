import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/RAG_Empresarial/',
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  },

  server: {
    host: 'localhost',
    port: 5173,

    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost-cert.pem')),
    },
    open: true,
  },

  optimizeDeps: {
    include: ['react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
  },
});
