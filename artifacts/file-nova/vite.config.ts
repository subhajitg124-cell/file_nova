import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      vitePrerenderPlugin({
        prerenderScript: path.resolve(__dirname, 'src/entry-prerender.tsx'),
        renderTarget: '#root',
      })
    ],
    root: __dirname,
    envDir: path.resolve(__dirname, '../../'),
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Enable code splitting and chunk optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-toast',
              '@radix-ui/react-tabs',
              '@radix-ui/react-select',
              '@radix-ui/react-progress',
            ],
            // Heavy libraries in separate chunks (lazy loaded)
            'pdf-lib': ['pdf-lib'],
            'pdfjs': ['pdfjs-dist'],
            'xlsx': ['xlsx'],
            'jszip': ['jszip'],
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable minification
      minify: 'terser' as const,
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'wouter'],
      exclude: ['@imgly/background-removal', 'onnxruntime-web'], // Don't pre-bundle heavy libs
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:4173',
          changeOrigin: true,
        },
      },
    },
  };
});
