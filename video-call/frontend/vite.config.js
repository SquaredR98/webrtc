import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: readFileSync('./certs/cert.key'),
      cert: readFileSync('./certs/cert.crt')
    }
  },
  plugins: [react()],
})
