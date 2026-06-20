
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

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
      vitePrerenderPlugin({
        prerenderScript: path.resolve(__dirname, 'src/entry-prerender.tsx'),
        renderTarget: '#root',
        additionalPrerenderRoutes: [
          "/merge-pdf",
          "/split-pdf",
          "/compress-pdf",
          "/rotate-pdf",
          "/protect-pdf",
          "/unlock-pdf",
          "/aadhaar-mask",
          "/aadhaar-mask-pdf",
          "/pan-card-resize",
          "/scholarship-zip",
          "/ocr",
          "/resize-photo",
          "/resize-image",
          "/ai-background-remover",
          "/remove-background",
          "/pdf-to-word",
          "/pdf-to-jpg",
          "/jpg-to-pdf",
          "/word-to-pdf",
          "/compress-for-upload",
          "/government-form-fill",
          "/ai-pdf-summary",
          "/ai-ppt-maker",
          "/compress-image",
          "/tools",
          "/pdf-tools",
          "/image-tools",
          "/video-tools",
          "/document-tools",
          "/pricing",
          "/blog",
          "/referral",
          "/student-offer",
          "/resources",
          "/contact",
          "/privacy",
          "/terms",
          "/cookie-policy",
          "/tools/scan-to-pdf",
          "/tools/pdf-reorder",
          "/tools/pdf-rotate",
          "/tools/pdf-delete",
          "/tools/pdf-crop",
          "/tools/pdf-annotate",
          "/tools/pdf-sign",
          "/tools/pdf-watermark",
          "/tools/pdf-page-numbers",
          "/tools/pdf-insert-link",
          "/tools/pdf-insert-image",
          "/tools/pdf-insert-shape",
          "/tools/pdf-forms",
          "/tools/pdf-redact",
          "/tools/pdf-to-docx",
          "/tools/pdf-to-pptx",
          "/tools/pdf-to-excel",
          "/tools/pdf-to-images",
          "/tools/pdf-to-pdfa",
          "/tools/pdf-compare",
          "/tools/pdf-translate",
          "/tools/enhance",
          "/tools/image-crop",
          "/tools/image-rotate",
          "/tools/image-watermark",
          "/tools/convert-format",
          "/tools/to-ico",
          "/tools/svg-to-png",
          "/tools/merge-docs",
          "/tools/pptx-to-pdf",
          "/tools/xlsx-to-csv",
          "/tools/csv-to-xlsx",
          "/tools/md-to-html",
          "/tools/html-to-md",
          "/tools/html-to-zip",
          "/tools/compress-doc",
          "/tools/docx-cleanup",
          "/tools/trim",
          "/tools/video-to-audio",
          "/tools/video-to-gif",
          "/tools/compress-audio",
          "/tools/passport-photo",
          "/tools/signature-resize"
        ]
      }),
      {
        name: 'vite-plugin-force-exit',
        closeBundle() {
          console.log("=== VITE BUILD COMPLETED SUCCESSFULLY ===");
          try {
            console.log("Running sitemap update...");
            const today = new Date().toISOString().split("T")[0];
            const updateFile = (filePath: string) => {
              if (fs.existsSync(filePath)) {
                const xml = fs.readFileSync(filePath, "utf8");
                const updated = xml.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
                fs.writeFileSync(filePath, updated, "utf8");
                console.log(`Updated lastmod in ${filePath} → ${today}`);
              } else {
                console.log(`Skipping ${filePath} (not found)`);
              }
            };
            updateFile(path.resolve(__dirname, "public/sitemap.xml"));
            updateFile(path.resolve(__dirname, "dist/sitemap.xml"));
          } catch (e) {
            console.error("Sitemap update failed:", e);
          }
          console.log("Forcing process exit to prevent hanging...");
          setTimeout(() => {
            process.exit(0);
          }, 100);
        }
      }
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
