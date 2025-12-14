import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  base: './',
  build: {
    outDir: '../assets',
    emptyOutDir: false,
    assetsDir: '',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'frontend/js/app.js'),
      },
      output: {
        entryFileNames: 'pieces-[name].js',
        chunkFileNames: 'pieces-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'pieces-[name][extname]';
          }
          return 'pieces-[name][extname]';
        },
        // Manual chunks for better caching - vendor libraries change less frequently
        manualChunks: {
          // GSAP and plugins - core animation library
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/Flip', 'gsap/SplitText'],
          // Lenis smooth scroll
          lenis: ['lenis'],
          // Swup and plugins - page transitions
          swup: [
            'swup',
            '@swup/body-class-plugin',
            '@swup/head-plugin',
            '@swup/js-plugin',
            '@swup/preload-plugin',
            '@swup/scripts-plugin'
          ],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    // Tree shake unused code
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend'),
      '@js': resolve(__dirname, 'frontend/js'),
      '@css': resolve(__dirname, 'frontend/css'),
      '@components': resolve(__dirname, 'frontend/js/components'),
      '@managers': resolve(__dirname, 'frontend/js/managers'),
      '@utils': resolve(__dirname, 'frontend/js/utils'),
    },
  },
  // Optimize deps for faster dev
  optimizeDeps: {
    include: ['gsap', 'lenis', 'swup'],
  },
});
