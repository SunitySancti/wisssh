import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import jsconfigPaths from "vite-jsconfig-paths";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  build: {
    outDir: "build"
  },
  server: {
    host:"localhost",
    // host: '0.0.0.0',
    // host:"192.168.1.101",
    port:3000,
    strictPort: true,
    // https: false,
    // cors: false,
    hmr: {
        host:"localhost",
        // host: '0.0.0.0',
        // host:"192.168.1.101",
        // clientPort: 443 // Run the websocket server on the SSL port
    },
    proxy: {
        '/api': 'https://wissshapi-1-u7107658.deta.app'
        // '/api': 'http://localhost:3333'
    }
  }
});