import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Barbearia Style',
        short_name: 'Barbearia',
        description: 'Barbearia Style - Estilo e tradição em cada corte',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    compression()
  ],
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: [
            "axios",
            "react-router-dom",
            "react-hook-form",
            "react-icons",
          ],
          icons: ['lucide-react']
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
