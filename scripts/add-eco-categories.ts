/**
 * Add missing categories and dosage forms for ECO catalog import
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('Adding missing categories and dosage forms...\n');

  // Add missing categories
  const categoriesToAdd = [
    { name: 'Brain Health', slug: 'brain-health', legacy_id: 'brain-health', description: 'Cognitive support, memory, and brain function supplements' },
    { name: 'Liver Support', slug: 'liver-support', legacy_id: 'liver-support', description: 'Liver detox, cleanse, and support supplements' },
    { name: 'Bone Health', slug: 'bone-health', legacy_id: 'bone-health', description: 'Calcium, vitamin D, and bone support supplements' },
    { name: 'Hormone Support', slug: 'hormone-support', legacy_id: 'hormone-support', description: 'Hormone balance and support supplements' },
    { name: 'Joint Health', slug: 'joint-health', legacy_id: 'joint-health', description: 'Joint support, glucosamine, and mobility supplements' },
  ];

  for (const category of categoriesToAdd) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category.slug)
      .single();

    if (existing) {
      console.log(`Category "${category.name}" already exists`);
    } else {
      const { error } = await supabase.from('categories').insert(category);
      if (error) {
        console.error(`Failed to add category "${category.name}": ${error.message}`);
      } else {
        console.log(`Added category: ${category.name}`);
      }
    }
  }

  console.log('');

  // Add missing dosage forms
  const dosageFormsToAdd = [
    { name: 'Chews', slug: 'chews', legacy_id: 'chews' },
    { name: 'Liquid', slug: 'liquid', legacy_id: 'liquid' },
  ];

  for (const form of dosageFormsToAdd) {
    const { data: existing } = await supabase
      .from('dosage_forms')
      .select('id')
      .eq('slug', form.slug)
      .single();

    if (existing) {
      console.log(`Dosage form "${form.name}" already exists`);
    } else {
      const { error } = await supabase.from('dosage_forms').insert(form);
      if (error) {
        console.error(`Failed to add dosage form "${form.name}": ${error.message}`);
      } else {
        console.log(`Added dosage form: ${form.name}`);
      }
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
