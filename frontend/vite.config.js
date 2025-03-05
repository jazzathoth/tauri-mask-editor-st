import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    strictPort: true,
    port: 5173, // Tauri's default port
  },
  build: {
    target: "chrome105", // Ensures compatibility with Tauri's WebView
    outDir: "../src-tauri/target", // Matches your Tauri config
    emptyOutDir: true,
  },
})
