import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Repo is served from https://<user>.github.io/web-blackjack-21/
  base: '/web-blackjack-21/',
  plugins: [react()],
})
