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
        // Dosage Forms
        'https://nutricraftlabs.com/dosage-forms/tablets',
        'https://nutricraftlabs.com/dosage-forms/capsules',
        'https://nutricraftlabs.com/dosage-forms/powders',
        'https://nutricraftlabs.com/dosage-forms/gummies',
        'https://nutricraftlabs.com/dosage-forms/chewables',
        'https://nutricraftlabs.com/dosage-forms/oral-disintegrating-tablets',
        'https://nutricraftlabs.com/dosage-forms/softgels',
        'https://nutricraftlabs.com/dosage-forms/effervescent',
        'https://nutricraftlabs.com/dosage-forms/liquids',
        // Blog
        'https://nutricraftlabs.com/blog',
        // Ingredient Hub & Detail Pages
        'https://nutricraftlabs.com/ingredients',
        'https://nutricraftlabs.com/ingredients/omega-3-fish-oil',
        'https://nutricraftlabs.com/ingredients/collagen',
        'https://nutricraftlabs.com/ingredients/vitamin-d3',
        'https://nutricraftlabs.com/ingredients/probiotics',
        'https://nutricraftlabs.com/ingredients/magnesium',
        'https://nutricraftlabs.com/ingredients/protein-powder',
        'https://nutricraftlabs.com/ingredients/vitamin-b12',
        'https://nutricraftlabs.com/ingredients/turmeric-curcumin',
        'https://nutricraftlabs.com/ingredients/ashwagandha',
        'https://nutricraftlabs.com/ingredients/creatine',
        'https://nutricraftlabs.com/ingredients/nmn',
        'https://nutricraftlabs.com/ingredients/glp-1-support',
        'https://nutricraftlabs.com/ingredients/functional-mushrooms',
        'https://nutricraftlabs.com/ingredients/postbiotics',
        // Market Hub & Detail Pages
        'https://nutricraftlabs.com/markets',
        'https://nutricraftlabs.com/canada-supplement-manufacturing',
        'https://nutricraftlabs.com/united-states-supplement-manufacturing',
        'https://nutricraftlabs.com/ontario-supplement-manufacturing',
        'https://nutricraftlabs.com/british-columbia-supplement-manufacturing',
        'https://nutricraftlabs.com/alberta-supplement-manufacturing',
        'https://nutricraftlabs.com/quebec-supplement-manufacturing',
        'https://nutricraftlabs.com/california-supplement-manufacturing',
        'https://nutricraftlabs.com/texas-supplement-manufacturing',
        'https://nutricraftlabs.com/florida-supplement-manufacturing',
        'https://nutricraftlabs.com/new-york-supplement-manufacturing'
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