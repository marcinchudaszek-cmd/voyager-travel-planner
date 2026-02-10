import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/voyager-travel-planner/',  // ← zmień na nazwę repo na GitHub
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
