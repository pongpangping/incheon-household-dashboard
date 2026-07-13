import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// build 시 모든 JS/CSS/데이터를 dist/index.html 하나에 인라인 → 더블클릭으로 열림
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: { assetsInlineLimit: 100000000, chunkSizeWarningLimit: 100000 },
})
