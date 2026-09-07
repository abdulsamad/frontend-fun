import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'prompt',
      injectRegister: null,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,json}'],
      },
    }),
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
});
