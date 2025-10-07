import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const dosageForms = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    metaDescription: z.string().optional()
  })
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Nutricraft Labs'),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

export const collections = {
  'dosage-forms': dosageForms,
  'blog': blog
};