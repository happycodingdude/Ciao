import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const env = loadEnv("all", process.cwd());

export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     // host: '0.0.0.0',
  //     // port: 5000,
  //     "/auth/api": {
  //       target: env.VITE_ASPNETCORE_AUTHENTICATION_URL,
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace("/auth/api", ""),
  //     },
  //     "/chat/api": {
  //       target: env.VITE_ASPNETCORE_CHAT_URL,
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace("/chat/api", ""),
  //     },
  //   },
  // },
  // define: {
  //   // "process.env": process.env,
  //   // // By default, Vite doesn't include shims for NodeJS/
  //   // // necessary for segment analytics lib to work
  //   _global: {},
  // },
  define: {
    global: "globalThis",
  },
});
