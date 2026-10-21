import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Spotify solo acepta http para loopback explícito (127.0.0.1), no "localhost".
const server = { host: '127.0.0.1', port: 5173, strictPort: true };

export default defineConfig({
  plugins: [react()],
  server: {
    ...server,
    // En este disco (F:) el watcher nativo pierde cambios rápidos y Vite sirve
    // versiones viejas de los archivos. Polling es un poco más costoso pero fiable.
    watch: { usePolling: true, interval: 300 },
  },
  preview: server,
});
