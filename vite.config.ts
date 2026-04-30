import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'Clarity Photography Demo',
          short_name: 'Clarity',
          description: 'A business management application for photography',
          theme_color: '#ffffff',
          icons: [
            {
              src: '192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
  };
});