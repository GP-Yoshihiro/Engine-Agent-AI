import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // ポートが使用中の場合は別ポートへ自動フォールバックせず即座にエラーにする。
    // フォールバックすると electron:dev の wait-on が待つポートとズレ、
    // 古いElectronウィンドウを操作してしまう事故につながるため。
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
