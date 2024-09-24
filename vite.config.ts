import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'/crm_front_react/',
  build:{
    outDir: 'build',
    minify: false, // disable minification for easier debugging
  }
})
