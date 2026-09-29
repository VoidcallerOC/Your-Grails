import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['4173-ierzxugvac466kb8qzfia-a5caedb4.us1.manus.computer'],
  },
})
