import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'suppress-vite-ws-when-hmr-disabled',
        transform(code, id) {
          if (id.includes('vite/dist/client/client.mjs')) {
            return code
              .replace('const socket = options.createConnection();', 'return;')
              .replace('ws.send(JSON.stringify(data));', 'ws?.send?.(JSON.stringify(data));')
              .replace('else throw new SendBeforeConnectError("send was called before connect");', 'else return;')
              .replace('else throw new SendBeforeConnectError("invoke was called before connect");', 'else return;');
          }
          return null;
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା',
          short_name: 'କୃଷକ ବାଣୀ',
          description: 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା - Agricultural advisory, Crop Doctor AI, weather, pesticide dosing & emergency safety for Odisha farmers',
          theme_color: '#15803d',
          background_color: '#14532d',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /\/(disease-photos|diseases)\/.*\.(png|jpg|jpeg|webp|svg)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'krushak-saved-crops-disease-photos-v1',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'weather-api-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 3, // 3 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
      },
    },
    server: {
      hmr: false,
      ws: false as const,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
