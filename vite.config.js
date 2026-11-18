
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['shimmering-enthusiasm-production-00eeabae.up.railway.app'],
  },
})
