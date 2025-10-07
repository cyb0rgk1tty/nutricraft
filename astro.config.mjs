// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import { getCollection } from 'astro:content';

// Dynamically generate blog post URLs for sitemap
async function getBlogUrls() {
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  return blogPosts.map((post) => `https://nutricraftlabs.com/blog/${post.id}`);
}

const blogUrls = await getBlogUrls();

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
        'https://nutricraftlabs.com/blog',
        ...blogUrls // Automatically includes all published blog posts
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