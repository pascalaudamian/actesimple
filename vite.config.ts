import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The hosted preview proxies HTTP but does not proxy Vite's HMR WebSocket.
      // Disable HMR so the injected Vite client does not repeatedly report closed sockets.
      hmr: false,
      watch: null,
    },
  };
});
