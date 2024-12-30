import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const env = loadEnv("all", process.cwd());

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: env.VITE_ASPNETCORE_CHAT_URL,
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace("/chat", ""),
      },
      "/auth/src/assets": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ""),
      },
    },
  },
  define: {
    // "process.env": process.env,
    // // By default, Vite doesn't include shims for NodeJS/
    // // necessary for segment analytics lib to work
    _global: {},
  },
  define: {
    global: "globalThis",
  },
});
