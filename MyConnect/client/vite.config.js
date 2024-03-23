import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";

const env = loadEnv("all", process.cwd());

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    proxy: {
      "/api": {
        target: env.VITE_ASPNETCORE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace("/api", ""),
      },
    },
  },
  // define: {
  //   // "process.env": process.env,
  //   // // By default, Vite doesn't include shims for NodeJS/
  //   // // necessary for segment analytics lib to work
  //   _global: {},
  // },
});
