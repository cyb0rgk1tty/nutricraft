/**
 * Branded Product Lines
 * Ready-to-brand product lines for the "Our Products" section.
 * Separate from the internal product catalog (products.js).
 */

export const brandedCategories = [
  {
    id: 'electrolytes',
    name: 'Electrolyte Drink Mixes',
    slug: 'electrolytes',
    tagline: 'Premium hydration formulas ready for your brand',
    description: 'Our electrolyte drink mix line features three distinct formulations, each available in four refreshing flavors. Perfect for white label or private label brands targeting fitness, wellness, and active lifestyle markets.',
    image: '/images/products/electrolytes-category-1200.webp',
    comingSoon: false,
    highlights: [
      '3 stock formulations ready for your branding',
      '4 refreshing flavor options per formula',
      'Stick packs and sachets for on-the-go convenience',
    ],
  },
  {
    id: 'high-carb',
    name: 'High Carb Drink Mixes',
    slug: 'high-carb',
    tagline: 'Fuel for endurance athletes and high-intensity training',
    description: 'Carbohydrate-rich drink mixes engineered for sustained energy output. Ideal for endurance sports, marathon training, cycling, and high-intensity workouts where glycogen replenishment is critical.',
    image: '/images/products/high-carb-category.webp',
    comingSoon: true,
    highlights: [
      'Multiple carb sources for sustained energy release',
      'Designed for endurance and high-intensity sports',
      'Customizable ratios for different athlete needs',
    ],
  },
  {
    id: 'protein',
    name: 'Protein Drinks',
    slug: 'protein',
    tagline: 'Ready-to-mix protein formulas for recovery and muscle growth',
    description: 'Premium protein drink formulations using whey, plant-based, and blended protein sources. Designed for post-workout recovery, meal replacement, and daily protein supplementation across fitness and wellness markets.',
    image: '/images/products/protein-category.webp',
    comingSoon: true,
    highlights: [
      'Whey, plant-based, and blended protein options',
      'Optimized amino acid profiles for recovery',
      'Clean label formulations with natural flavoring',
    ],
  },
];

export const brandedProducts = [
  {
    id: 'electrolyte-hydration-plus',
    name: 'Hydration Plus',
    slug: 'hydration-plus',
    categorySlug: 'electrolytes',
    description: 'A balanced everyday hydration formula with essential electrolytes and B vitamins. Designed for daily use, post-workout recovery, and general wellness. Low sugar, light and refreshing taste profile.',
    keyIngredients: ['Sodium', 'Potassium', 'Magnesium', 'Calcium', 'Vitamin B6', 'Vitamin B12'],
    flavors: ['Citrus Burst', 'Berry Blast', 'Tropical Punch', 'Watermelon Chill'],
    servingSize: '10g stick pack',
    moq: '1,000 units',
    leadTime: '4-6 weeks',
    priceRange: '$2.50 - $4.00 per unit',
    image: '/images/products/electrolytes-category-800.webp',
  },
  {
    id: 'electrolyte-endurance-fuel',
    name: 'Endurance Fuel',
    slug: 'endurance-fuel',
    categorySlug: 'electrolytes',
    description: 'A performance-focused electrolyte formula with added carbohydrates and amino acids for sustained energy during intense physical activity. Higher sodium content for heavy sweaters and endurance athletes.',
    keyIngredients: ['Sodium', 'Potassium', 'Magnesium', 'L-Glutamine', 'BCAAs', 'Cluster Dextrin'],
    flavors: ['Citrus Burst', 'Berry Blast', 'Tropical Punch', 'Watermelon Chill'],
    servingSize: '30g sachet',
    moq: '1,000 units',
    leadTime: '4-6 weeks',
    priceRange: '$3.50 - $5.50 per unit',
    image: '/images/products/electrolytes-category-800.webp',
  },
  {
    id: 'electrolyte-recovery-restore',
    name: 'Recovery & Restore',
    slug: 'recovery-restore',
    categorySlug: 'electrolytes',
    description: 'A recovery-optimized electrolyte blend with added zinc, vitamin C, and adaptogenic herbs. Formulated for post-exercise recovery, immune support, and stress relief. Zero sugar with natural sweeteners.',
    keyIngredients: ['Sodium', 'Potassium', 'Magnesium', 'Zinc', 'Vitamin C', 'Ashwagandha'],
    flavors: ['Citrus Burst', 'Berry Blast', 'Tropical Punch', 'Watermelon Chill'],
    servingSize: '12g stick pack',
    moq: '1,000 units',
    leadTime: '4-6 weeks',
    priceRange: '$3.00 - $4.50 per unit',
    image: '/images/products/electrolytes-category-800.webp',
  },
];
