import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import jsconfigPaths from "vite-jsconfig-paths"


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), jsconfigPaths()],
    build: {
        outDir: "build"
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    server: {
        host: "localhost",
        port: 3000,
        strictPort: true,
        cors: true,
    }
})
