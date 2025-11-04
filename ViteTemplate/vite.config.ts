import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { aitPlugin } from 'vite-plugin-ait';

export default defineConfig({
  plugins: [
    react(),
    aitPlugin()
  ],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000
  }
});
