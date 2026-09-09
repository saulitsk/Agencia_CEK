import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Agencia_CEK/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        destinos: resolve(__dirname, 'destinos.html'),
        termos: resolve(__dirname, 'termos.html'),
        privacidade: resolve(__dirname, 'privacidade.html'),
        sac: resolve(__dirname, 'sac.html'),
      },
    },
  },
});
