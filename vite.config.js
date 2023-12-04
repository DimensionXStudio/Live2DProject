import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  manifest: true,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    // vite排除预构建electron，不然就炸了
    exclude: ['electron']
  },
  server: {
    proxy: {
    }
  },
  publicDir: './public',
})
