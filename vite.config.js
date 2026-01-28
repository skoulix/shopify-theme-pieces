import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(() => ({
  root: 'src',
  base: './',
  build: {
    outDir: '../assets',
    emptyOutDir: false,
    assetsDir: '',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'src/js/app.js'),
      },
      output: {
        entryFileNames: 'pieces-[name].js',
        chunkFileNames: 'pieces-[name].js',
        assetFileNames: 'pieces-[name][extname]',
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
      '@': resolve(__dirname, 'src'),
      '@js': resolve(__dirname, 'src/js'),
      '@css': resolve(__dirname, 'src/css'),
      '@components': resolve(__dirname, 'src/js/components'),
      '@managers': resolve(__dirname, 'src/js/managers'),
      '@utils': resolve(__dirname, 'src/js/utils'),
    },
  },
  // Optimize deps for faster dev
  optimizeDeps: {
    include: ['gsap', 'lenis', 'swup'],
  },
}));
