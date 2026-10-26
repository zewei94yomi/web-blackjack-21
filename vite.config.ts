import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs work both at the GitHub Pages subpath
  // (https://<user>.github.io/web-blackjack-21/) and at a host root
  // such as the Vercel project (https://web-blackjack-21.vercel.app/).
  base: './',
  plugins: [react()],
})
