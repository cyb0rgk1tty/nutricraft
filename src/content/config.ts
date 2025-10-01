import { defineCollection, z } from 'astro:content';

const dosageForms = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    metaDescription: z.string().optional()
  })
});

export const collections = {
  'dosage-forms': dosageForms
};