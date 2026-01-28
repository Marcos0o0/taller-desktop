import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer:
        process.env.NODE_ENV === 'test'
          ? undefined
          : {},
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@Router.tsx': path.resolve(__dirname, 'src/Router.tsx'),
      '@Main.tsx': path.resolve(__dirname, 'src/Main.tsx'),
      '@App.tsx': path.resolve(__dirname, 'src/App.tsx'),
      '@index.html': path.resolve(__dirname, 'src/index.html'),
      '@package.json': path.resolve(__dirname, 'package.json'),
      '@tsconfig.json': path.resolve(__dirname, 'tsconfig.json'),
      '@tsconfig.node.json': path.resolve(__dirname, 'tsconfig.node.json'),
      '@tsconfig.app.json': path.resolve(__dirname, 'tsconfig.app.json'),
    },
  },
})
