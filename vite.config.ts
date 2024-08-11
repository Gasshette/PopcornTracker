import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { qrcode } from 'vite-plugin-qrcode';
import Terminal from 'vite-plugin-terminal';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), qrcode(), Terminal({ output: ['terminal', 'console'] })],
});
