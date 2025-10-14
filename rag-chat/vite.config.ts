import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';

// ✅ Config 100 % compatible con React 19 + HTTPS local para cámara
export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  },

  // 🚀 Configuración del servidor local
  server: {
    host: 'localhost',
    port: 5173,

    // ✅ HTTPS activado (necesario para getUserMedia en navegador)
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost-cert.pem')),
    },

    // Opcional: abre automáticamente el navegador
    open: true,
  },

  // 🧩 Optimización de dependencias para React 19
  optimizeDeps: {
    include: ['react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
  },
});
