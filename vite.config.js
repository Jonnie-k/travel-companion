import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/travel-companion/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/firebase/**',
        'src/**/*.test.{js,jsx}',
        'src/setupTests.js',
      ],
      reporter: ['text', 'html'],
      all: true,
    },
  },
})
