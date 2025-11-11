// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
      // Allow ngrok host for external tunneling during development
      server: {
        // Add any hosts you want to allow here (addresses from tunneling services)
        allowedHosts: [
          'unsmugly-selenographical-eugenia.ngrok-free.dev'
        ],
      },
	},

  integrations: [react()],
});