import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Ensure GEMINI_API_KEY is always a string, even if it's 'undefined' string or actual undefined
    const geminiApiKey = (env.GEMINI_API_KEY === 'undefined' || !env.GEMINI_API_KEY) ? '' : env.GEMINI_API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
        watch: null,
        allowedHosts: true
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          devOptions: {
            enabled: true
          },
          includeAssets: ['golden-logo.jpg'],
          workbox: {
            maximumFileSizeToCacheInBytes: 10000000, // Increase to 10MB
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/img\.icons8\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'icons-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          },
          manifest: {
            name: 'گۆڵدن ئێکسچەینج - Golden Exchange',
            short_name: 'گۆڵدن ئێکس',
            description: 'The best and fastest source for currency, metal, and crypto rates in Iraq and the world',
            theme_color: '#020617',
            background_color: '#020617',
            display: 'standalone',
            display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
            orientation: 'portrait',
            categories: ['finance', 'business'],
            scope: '/',
            start_url: '/',
            id: '/',
            prefer_related_applications: false,
            icons: [
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '72x72',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '96x96',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '128x128',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '144x144',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '152x152',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '192x192',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '384x384',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '512x512',
                type: 'image/jpeg',
                purpose: 'any'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '192x192',
                type: 'image/jpeg',
                purpose: 'maskable'
              },
              {
                src: '/golden-logo.jpg?v=8',
                sizes: '512x512',
                type: 'image/jpeg',
                purpose: 'maskable'
              }
            ]
          }
        })
      ],
      build: {
        minify: true,
        cssMinify: true,
        reportCompressedSize: false,
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': ['react', 'react-dom', 'framer-motion', 'lucide-react', 'socket.io-client'],
              'ui': ['react-virtuoso', 'recharts']
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(geminiApiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
