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
        'https://nutricraftlabs.com/dosage-forms/tablets',
        'https://nutricraftlabs.com/dosage-forms/capsules',
        'https://nutricraftlabs.com/dosage-forms/powders',
        'https://nutricraftlabs.com/dosage-forms/gummies',
        'https://nutricraftlabs.com/dosage-forms/chewables',
        'https://nutricraftlabs.com/dosage-forms/oral-disintegrating-tablets',
        'https://nutricraftlabs.com/dosage-forms/softgels',
        'https://nutricraftlabs.com/dosage-forms/effervescent',
        'https://nutricraftlabs.com/dosage-forms/liquids',
        'https://nutricraftlabs.com/blog'
        // Blog posts and tag pages auto-discovered via getStaticPaths()
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