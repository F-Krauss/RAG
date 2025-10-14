import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ✅ Config 100 % compatible con React 19 (sin require, sin index.js)
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  },
  optimizeDeps: {
    include: ['react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
  },
});
