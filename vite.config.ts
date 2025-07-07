import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        // Only proxy to the real backend when not in dev (so MSW can mock in dev)
        ...(!import.meta.env.DEV && {
            proxy: {
                '/api/accounting': {
                    target: 'http://localhost:4000',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/accounting/, ''),
                },
            },
        }),
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
