import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://hostel-final.onrender.com",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor":  ["react", "react-dom", "react-router-dom"],
          "query-vendor":  ["@tanstack/react-query"],
          "form-vendor":   ["react-hook-form", "@hookform/resolvers", "zod"],
          "ui-vendor":     ["lucide-react", "react-hot-toast"],
          "axios-vendor":  ["axios"],
          "zustand-vendor":["zustand"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
