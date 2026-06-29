
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {execSync} from 'child_process';
import {defineConfig} from 'vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    static fromMatrix() { return new DOMMatrix(); }
    static fromFloat32Array() { return new DOMMatrix(); }
    static fromFloat64Array() { return new DOMMatrix(); }
    translate() { return this; }
    scale() { return this; }
    multiply() { return this; }
    inverse() { return this; }
    transformPoint(p: any) { return p; }
  } as any;
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicons/favicon.ico', 'robots.txt', 'favicons/apple-touch-icon.png'],
        manifest: {
          name: 'FileNova',
          short_name: 'FileNova',
          description: 'Free online PDF tools built for India. Merge, split, compress, convert PDFs and manage Indian government documents offline.',
          theme_color: '#0d1b2a',
          background_color: '#0d1b2a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/favicons/android-chrome-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/favicons/android-chrome-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Cache all static assets, WASM binaries, and workers
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
          // Runtime caching for large WASM binaries and model files
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.tailwindcss\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tailwind-cdn',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.wasm$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'wasm-binaries',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 2487 * 24 },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.onnx$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'onnx-models',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 7 * 24 },
              },
            },
          ],
          // Skip waiting for new SW to activate
          skipWaiting: true,
          clientsClaim: true,
          // Cleanup outdated caches
          cleanupOutdatedCaches: true,
        },
        // Dev options for testing
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
      // vitePrerenderPlugin({
      //   prerenderScript: path.resolve(__dirname, 'src/entry-prerender.tsx'),
      //   renderTarget: '#root',
      //   additionalPrerenderRoutes: [
      //     "/merge-pdf",
      //     "/split-pdf",
      //     "/compress-pdf",
      //     "/rotate-pdf",
      //     "/protect-pdf",
      //     "/unlock-pdf",
      //     "/aadhaar-mask",
      //     "/aadhaar-mask-pdf",
      //     "/pan-card-resize",
      //     "/scholarship-zip",
      //     "/ocr",
      //     "/resize-photo",
      //     "/resize-image",
      //     "/ai-background-remover",
      //     "/remove-background",
      //     "/pdf-to-word",
      //     "/pdf-to-jpg",
      //     "/jpg-to-pdf",
      //     "/word-to-pdf",
      //     "/compress-pdf-for-upload",
      //     "/government-form-fill",
      //     "/ai-pdf-summary",
      //     "/compress-image",
      //     "/tools",
      //     "/pdf-tools",
      //     "/image-tools",
      //     "/video-tools",
      //     "/document-tools",
      //     "/pricing",
      //     "/blog",
      //     "/referral",
      //     "/student-offer",
      //     "/resources",
      //     "/contact",
      //     "/privacy",
      //     "/terms",
      //     "/cookie-policy",
      //     "/tools/scan-to-pdf",
      //     "/tools/pdf-reorder",
      //     "/tools/pdf-rotate",
      //     "/tools/pdf-delete",
      //     "/tools/pdf-crop",
      //     "/tools/pdf-annotate",
      //     "/tools/pdf-sign",
      //     "/tools/pdf-watermark",
      //     "/tools/pdf-page-numbers",
      //     "/tools/pdf-insert-link",
      //     "/tools/pdf-insert-image",
      //     "/tools/pdf-insert-shape",
      //     "/tools/pdf-forms",
      //     "/tools/pdf-redact",
      //     "/tools/pdf-to-docx",
      //     "/tools/pdf-to-pptx",
      //     "/tools/pdf-to-excel",
      //     "/tools/pdf-to-images",
      //     "/tools/pdf-to-pdfa",
      //     "/tools/pdf-compare",
      //     "/tools/pdf-translate",
      //     "/tools/enhance",
      //     "/tools/image-crop",
      //     "/tools/image-rotate",
      //     "/tools/image-watermark",
      //     "/tools/convert-format",
      //     "/tools/to-ico",
      //     "/tools/svg-to-png",
      //     "/tools/merge-docs",
      //     "/tools/pptx-to-pdf",
      //     "/tools/xlsx-to-csv",
      //     "/tools/csv-to-xlsx",
      //     "/tools/md-to-html",
      //     "/tools/html-to-md",
      //     "/tools/html-to-zip",
      //     "/tools/compress-doc",
      //     "/tools/docx-cleanup",
      //     "/workspace",
      //     "/workflows",
      //     "/india-tools",
      //     "/tools/trim",
      //     "/tools/video-to-audio",
      //     "/tools/video-to-gif",
      //     "/tools/compress-audio",
      //     "/tools/passport-photo",
      //     "/tools/signature-resize",
      //     "/blog/compress-pdf-free-online",
      //     "/blog/merge-pdf-files-online",
      //     "/blog/image-to-pdf-mobile",
      //     "/blog/free-pdf-tools-students-india",
      //     "/blog/fill-aadhaar-form-online",
      //     "/blog/aadhaar-masking-privacy-india",
      //     "/blog/optimize-photos-indian-portals"
      //   ]
      // }),
      {
        name: 'vite-plugin-postbuild',
        closeBundle() {
          console.log("=== VITE BUILD COMPLETED SUCCESSFULLY ===");
          try {
            console.log("Generating all sitemaps...");
            execSync("node scripts/update-sitemap.js", { stdio: "inherit", cwd: __dirname });
          } catch (e) {
            console.error("Sitemap generation failed:", e);
          }
          console.log("Forcing process exit to prevent hanging...");
          setTimeout(() => {
            process.exit(0);
          }, 100);
        }
      },
      visualizer({
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
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
      cssCodeSplit: true,
      // Enable code splitting and chunk optimization
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('wouter')) {
                return 'react-core';
              }
              if (id.includes('framer-motion')) {
                return 'animations';
              }
              if (id.includes('@tanstack') || id.includes('react-query')) {
                return 'react-query';
              }
              if (id.includes('zustand')) {
                return 'state';
              }
              if (id.includes('@radix-ui') || id.includes('lucide-react')) {
                return 'ui-kit';
              }
              if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) {
                return 'pdf-utils';
              }
              if (id.includes('xlsx') || id.includes('jszip')) {
                return 'excel-utils';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor';
              }
              if (id.includes('@imgly') || id.includes('onnxruntime') || id.includes('tesseract.js')) {
                return 'ai-models';
              }
              return 'vendor';
            }
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
    ssr: {
      noExternal: ['wouter'],
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
