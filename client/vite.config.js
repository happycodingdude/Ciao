import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import fixReactVirtualized from "esbuild-plugin-react-virtualized";
import { defineConfig, loadEnv } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const env = loadEnv("all", process.cwd());

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    visualizer({
      open: true,          // tự mở browser sau build
      gzipSize: true,      // hiển thị gzip size
      brotliSize: true,    // hiển thị brotli size
      filename: "stats.html", // file output
      template: "treemap", // dễ nhìn nhất
    }),
  ],
  server: {
    proxy: {
      // "/api": {
      //   target: env.VITE_ASPNETCORE_CHAT_URL,
      //   changeOrigin: true,
      //   secure: false,
      //   // rewrite: (path) => path.replace("/chat", ""),
      // },
      "/auth/src/assets": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ""),
      },
    },
    // historyApiFallback: true, // ✅ Đây là phần quan trọng
  },
  define: {
    // "process.env": process.env,
    // // By default, Vite doesn't include shims for NodeJS/
    // // necessary for segment analytics lib to work
    _global: {},
    global: "globalThis",
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
});
