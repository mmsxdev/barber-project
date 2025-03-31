import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  base: "/",
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // Crucial para alguns pacotes
      include: [/react-hook-form/, /react-icons/, /node_modules/],
    },
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
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
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "react-hook-form": "react-hook-form/dist/index.cjs",
      "react-icons": "react-icons",
    },
  },
});
