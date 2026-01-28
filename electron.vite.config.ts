import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '@api': resolve('src/api'),
        '@store': resolve('src/store'),
        '@types': resolve('src/types'),
        '@components': resolve('src/components'),
        '@utils': resolve('src/utils')
      }
    },
    plugins: [react()],
    define: {
      'process.env': {}
    }
  }
})