import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'query-vendor': ['@tanstack/react-query'],
                    'charts-vendor': ['recharts'],
                    'scanner-vendor': ['@zxing/library', '@zxing/browser'],
                },
            },
        },
    },
});
