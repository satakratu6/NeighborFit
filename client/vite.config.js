import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mui/icons-material': path.resolve(__dirname, 'node_modules/@mui/icons-material'),
    },
  },
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'os', 'crypto']
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  define: {
    'process.env': {}
  }
})