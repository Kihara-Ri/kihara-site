import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 先让 MDX 运行在 pre 阶段，避免和 React 插件冲突
    mdx(),
    react()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // @ -> /absolute/path/to/arc
    }
  },
  build: {
    outDir: '/var/www/personal-site/dist',
    emptyOutDir: true // 显式允许清空非项目目录
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
