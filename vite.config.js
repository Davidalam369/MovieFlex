import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
   base: "/MoveApp/",
  plugins: [react()],
  
  publicDir: 'public',
})
