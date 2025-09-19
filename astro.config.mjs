// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(), 
    sitemap({
      customPages: [
        'https://nutricraftlabs.com/formulations/tablets',
        'https://nutricraftlabs.com/formulations/capsules',
        'https://nutricraftlabs.com/formulations/powders',
        'https://nutricraftlabs.com/formulations/gummies',
        'https://nutricraftlabs.com/formulations/chewables',
        'https://nutricraftlabs.com/formulations/oral-disintegrating-tablets',
        'https://nutricraftlabs.com/formulations/softgels',
        'https://nutricraftlabs.com/formulations/effervescent',
        'https://nutricraftlabs.com/formulations/liquids'
      ]
    }), 
    robotsTxt()
  ],
  output: 'server',
  adapter: vercel(),
  site: 'https://Nutricraftlabs.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
    format: 'directory'
  },
  vite: {
    build: {
      cssMinify: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]'
        }
      }
    }
  }
});