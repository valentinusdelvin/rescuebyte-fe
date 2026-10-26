import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite configuration with Tailwind and React plugins
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: [
      'charts-advocate-block-selection.trycloudflare.com',
      'decimal-rewards-cruises-generate.trycloudflare.com'
    ]
  }
});
