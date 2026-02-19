import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

// En Docker, el frontend ve al backend por el nombre de servicio "backend:8000".
// El proxy hace que fetch('/api/...') rote al backend sin CORS ni URLs absolutas.
export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { clientPort: 5173 },
    watch: { usePolling: !!process.env.CHOKIDAR_USEPOLLING },
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
