import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import fixReactVirtualized from "esbuild-plugin-react-virtualized";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

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
      // open: true, // tự mở browser sau build
      gzipSize: true, // hiển thị gzip size
      brotliSize: true, // hiển thị brotli size
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - most stable, cache forever
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "react-vendor";
          }

          // Router & Query - frequently updated
          if (id.includes("@tanstack/react-router")) {
            return "router-vendor";
          }

          if (id.includes("@tanstack/react-query")) {
            return "query-vendor";
          }

          // Ant Design icons only (no full antd)
          if (id.includes("@ant-design/icons")) {
            return "icons-vendor";
          }

          // Firebase - lazy load by feature
          if (id.includes("firebase/app") || id.includes("firebase/storage")) {
            return "firebase-core";
          }

          if (id.includes("firebase/messaging")) {
            return "firebase-messaging";
          }

          // SignalR
          if (id.includes("@microsoft/signalr")) {
            return "signalr-vendor";
          }

          // Emoji picker - lazy load
          if (id.includes("emoji-mart") || id.includes("@emoji-mart")) {
            return "emoji-vendor";
          }

          // Lodash-es (tree-shakeable)
          if (id.includes("lodash-es")) {
            return "lodash-vendor";
          }

          // Lightbox - lazy load
          if (id.includes("yet-another-react-lightbox")) {
            return "lightbox-vendor";
          }

          // Axios & related
          if (id.includes("axios")) {
            return "axios-vendor";
          }

          // Dayjs
          if (id.includes("dayjs")) {
            return "dayjs-vendor";
          }

          // React utilities
          if (id.includes("react-hook-form") || id.includes("react-toastify")) {
            return "react-utils";
          }

          // Other node_modules
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: "esbuild",
    target: "es2015",
    // Additional optimizations
    cssCodeSplit: true,
    sourcemap: false,
  },
  // Optimize dependencies
  resolve: {
    alias: {
      // Optimize lodash imports
      "lodash-es": "lodash-es",
    },
  },
});
