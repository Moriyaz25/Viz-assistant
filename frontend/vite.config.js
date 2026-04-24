import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['viz-logo.svg', 'logo.png', 'favicon.ico'],
      manifest: {
        name: 'Vizassistance – AI Data Intelligence',
        short_name: 'Vizassistance',
        description: 'Upload your data and get instant AI-powered charts, insights, and visualizations.',
        theme_color: '#f59e0b',
        background_color: '#080808',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcuts: [
          { name: 'Dashboard', short_name: 'Dashboard', url: '/dashboard', icons: [{ src: '/pwa-icon.svg', sizes: 'any' }] },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts', 'reactflow'],
          'vendor-utils': ['xlsx', 'papaparse', 'jspdf', 'html2canvas'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
