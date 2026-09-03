import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi standar Vite + React, tidak ada yang custom di sini
export default defineConfig({
  plugins: [react()]
});
