import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    strictPort: true
  },
  preview: {
    allowedHosts: ['1.phamanh.id.vn', 'futureme.com.vn', 'futureme.phamanh.id.vn']
  },
  publicDir: 'public',
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.otf'],
  build: {
    assetsInlineLimit: 0
  }
})