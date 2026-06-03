import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite konfiguracija za React frontend; plugin ukljucuje JSX transformaciju i dev server podrsku.
export default defineConfig({
  plugins: [react()],
})
