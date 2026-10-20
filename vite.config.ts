import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Spotify solo acepta http para loopback explícito (127.0.0.1), no "localhost".
const server = { host: '127.0.0.1', port: 5173, strictPort: true };

export default defineConfig({
  plugins: [react()],
  server,
  preview: server,
});
