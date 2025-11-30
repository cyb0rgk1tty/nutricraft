/**
 * Product Catalog Data
 * Password-protected catalog of Nutricraft Labs stock formulas
 * Generated from supplement label screenshots
 */

// ============================================
// CATEGORIES
// ============================================

export const productCategories = [
  {
    id: 'sleep-relaxation',
    name: 'Sleep & Relaxation',
    slug: 'sleep-relaxation',
    description: 'Supplements designed to support restful sleep and promote relaxation.'
  },
  {
    id: 'energy-performance',
    name: 'Energy & Performance',
    slug: 'energy-performance',
    description: 'Formulas to boost energy levels and enhance physical performance.'
  },
  {
    id: 'immunity-wellness',
    name: 'Immunity & Wellness',
    slug: 'immunity-wellness',
    description: 'Products to support immune function and overall wellness.'
  },
  {
    id: 'cognitive-support',
    name: 'Cognitive Support',
    slug: 'cognitive-support',
    description: 'Supplements for brain health, focus, and mental clarity.'
  },
  {
    id: 'digestive-health',
    name: 'Digestive Health',
    slug: 'digestive-health',
    description: 'Formulations supporting gut health and digestive function.'
  },
  {
    id: 'multivitamins',
    name: 'Multivitamins',
    slug: 'multivitamins',
    description: 'Comprehensive vitamin and mineral formulations.'
  },
  {
    id: 'mens-health',
    name: "Men's Health",
    slug: 'mens-health',
    description: "Targeted supplements for men's vitality and wellness needs."
  },
  {
    id: 'womens-health',
    name: "Women's Health",
    slug: 'womens-health',
    description: "Specialized formulas for women's unique health needs."
  },
  {
    id: 'weight-management',
    name: 'Weight Management',
    slug: 'weight-management',
    description: 'Supplements to support healthy weight and metabolism.'
  },
  {
    id: 'heart-health',
    name: 'Heart & Cardiovascular',
    slug: 'heart-health',
    description: 'Formulas supporting cardiovascular health and circulation.'
  },
  {
    id: 'joint-bone',
    name: 'Joint & Bone Support',
    slug: 'joint-bone',
    description: 'Products for joint mobility and bone health.'
  },
  {
    id: 'liver-detox',
    name: 'Liver & Detox',
    slug: 'liver-detox',
    description: 'Formulas to support liver function and natural detoxification.'
  },
  {
    id: 'beauty',
    name: 'Hair, Skin & Nails',
    slug: 'beauty',
    description: 'Beauty supplements for healthy hair, skin, and nails.'
  },
  {
    id: 'eye-health',
    name: 'Eye Health',
    slug: 'eye-health',
    description: 'Supplements to support vision and eye health.'
  },
  {
    id: 'mushrooms',
    name: 'Mushroom Extracts',
    slug: 'mushrooms',
    description: 'Functional mushroom supplements for various health benefits.'
  },
  {
    id: 'specialty-formulas',
    name: 'Specialty Formulas',
    slug: 'specialty-formulas',
    description: 'Targeted supplements for specific health needs.'
  },
  {
    id: 'gummies',
    name: 'Gummies',
    slug: 'gummies',
    description: 'Delicious gummy supplements for easy daily nutrition.'
  },
  {
    id: 'powders',
    name: 'Powders',
    slug: 'powders',
    description: 'Versatile powder supplements for custom dosing and smoothies.'
  },
  {
    id: 'kids-health',
    name: "Kids Health",
    slug: 'kids-health',
    description: 'Safe and effective supplements designed for children.'
  },
  {
    id: 'specialty-formats',
    name: 'Specialty Formats',
    slug: 'specialty-formats',
    description: 'Unique supplement formats including resins and honey sticks.'
  }
];

// ============================================
// PRODUCTS
// ============================================

export const products = [
  // ----------------------------------------
  // SLEEP & RELAXATION
  // ----------------------------------------
  {
    id: 'calm-focus-blend',
    sku: 'DUR-C001',
    name: 'Calm & Focus Blend',
    categoryId: 'sleep-relaxation',
    description: 'A synergistic blend of magnesium, L-theanine, ashwagandha, and valerian root designed to support relaxation and healthy sleep patterns without morning grogginess.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Magnesium Citrate 100mg', 'L-Theanine 100mg', 'Ashwagandha Extract 150mg', 'Valerian Root Extract 120mg'],
    ingredients: [
      { name: 'Magnesium', amount: '100', unit: 'mg', dailyValue: '*', source: '(as Magnesium Citrate)' },
      { name: 'L-Theanine', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Ashwagandha Extract', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Valerian Root Extract', amount: '120', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'melatonin-sleep-support',
    sku: 'DUR-C002',
    name: 'Melatonin Sleep Support',
    categoryId: 'sleep-relaxation',
    description: 'Comprehensive sleep formula with melatonin, L-theanine, chamomile, and GABA to promote restful sleep and relaxation.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Melatonin 5mg', 'L-Theanine 100mg', 'Chamomile Extract 50mg', 'GABA 100mg', 'Magnesium 50mg'],
    ingredients: [
      { name: 'Melatonin', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'L-Theanine', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Chamomile Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'GABA', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'sleep-support-complex',
    sku: 'DUR-C003',
    name: 'Sleep Support Complex',
    categoryId: 'sleep-relaxation',
    description: 'Advanced sleep formula with a proprietary blend including lemon balm, L-theanine, magnesium glycinate, melatonin, and calming probiotics.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Proprietary Blend 760mg (Lemon Balm, L-Theanine, Magnesium Glycinate, Melatonin, Chamomile)'],
    ingredients: [
      { name: 'Proprietary Blend', amount: '760', unit: 'mg', dailyValue: '*', source: '(Lemon Balm, L-Theanine, Magnesium Glycinate, Melatonin, Chamomile)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'magnesium-glycinate',
    sku: 'DUR-C004',
    name: 'Magnesium Glycinate',
    categoryId: 'sleep-relaxation',
    description: 'Highly absorbable magnesium glycinate combined with L-theanine and ashwagandha for relaxation, muscle comfort, and restful sleep.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Magnesium Glycinate 200mg', 'L-Theanine 100mg', 'Ashwagandha Extract 100mg', 'Black Pepper Extract 5mg'],
    ingredients: [
      { name: 'Magnesium', amount: '200', unit: 'mg', dailyValue: '*', source: '(as Magnesium Glycinate)' },
      { name: 'L-Theanine', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Ashwagandha Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Black Pepper Extract', amount: '5', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'ashwagandha-stress-support',
    sku: 'DUR-C005',
    name: 'Ashwagandha Stress Support',
    categoryId: 'sleep-relaxation',
    description: 'Premium ashwagandha root extract with rhodiola, L-theanine, and essential minerals to help the body adapt to stress and support relaxation.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Ashwagandha Root Extract 600mg', 'Rhodiola Rosea Extract 100mg', 'L-Theanine 100mg', 'Magnesium 56mg', 'Zinc 15mg'],
    ingredients: [
      { name: 'Ashwagandha Root Extract', amount: '600', unit: 'mg', dailyValue: '*' },
      { name: 'Rhodiola Rosea Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'L-Theanine', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '56', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '15', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'l-tryptophan',
    sku: 'DUR-C006',
    name: 'L-Tryptophan',
    categoryId: 'sleep-relaxation',
    description: 'Essential amino acid L-tryptophan with 5-HTP and B vitamins to support serotonin production and promote healthy sleep cycles.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['L-Tryptophan 500mg', '5-HTP 50mg', 'Vitamin B6 1.4mg', 'Zinc 10mg', 'Magnesium 50mg'],
    ingredients: [
      { name: 'L-Tryptophan', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: '5-HTP', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '1.4', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // ENERGY & PERFORMANCE
  // ----------------------------------------
  {
    id: 'energy-performance-formula',
    sku: 'DUR-C007',
    name: 'Energy & Performance Formula',
    categoryId: 'energy-performance',
    description: 'Complete B-vitamin complex with magnesium and L-citrulline for natural energy production and metabolism support.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Vitamin B6 10mg', 'Magnesium 80mg', 'L-Citrulline 150mg'],
    ingredients: [
      { name: 'Vitamin B6', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '80', unit: 'mg', dailyValue: '*' },
      { name: 'L-Citrulline', amount: '150', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'energy-focus-support',
    sku: 'DUR-C008',
    name: 'Energy & Focus Support',
    categoryId: 'energy-performance',
    description: 'Advanced B-vitamin complex with acetyl L-carnitine, R-lipoic acid, and benfotiamine for sustained energy and mental clarity.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Vitamin B6 50mg', 'Vitamin B12 1000mcg', 'Acetyl L-Carnitine 600mg', 'R-Lipoic Acid 300mg', 'Benfotiamine 200mg'],
    ingredients: [
      { name: 'Vitamin B6', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B12', amount: '1000', unit: 'mcg', dailyValue: '*' },
      { name: 'Acetyl L-Carnitine', amount: '600', unit: 'mg', dailyValue: '*' },
      { name: 'R-Lipoic Acid', amount: '300', unit: 'mg', dailyValue: '*' },
      { name: 'Benfotiamine', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'nitric-oxide-complex',
    sku: 'DUR-C009',
    name: 'Nitric Oxide Complex',
    categoryId: 'energy-performance',
    description: 'Pre-workout and performance formula with L-citrulline, L-arginine, taurine, and stamina-boosting herbs for enhanced blood flow and endurance.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Nitric Oxide Complex 1.5g (L-Citrulline, L-Arginine AKG, L-Arginine HCL)', 'Amino Acid Support Blend', 'Stamina Surge Blend'],
    ingredients: [
      { name: 'Nitric Oxide Complex', amount: '1.5', unit: 'g', dailyValue: '*', source: '(L-Citrulline, L-Arginine AKG, L-Arginine HCL)' },
      { name: 'Amino Acid Support Blend', amount: '', unit: '', dailyValue: '*' },
      { name: 'Stamina Surge Blend', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'cordyceps-energy',
    sku: 'DUR-C010',
    name: 'Cordyceps Sinensis',
    categoryId: 'energy-performance',
    description: 'Adaptogenic mushroom blend with cordyceps, rhodiola, ginseng, and astragalus for natural energy and endurance support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Cordyceps Sinensis Extract 7% cordycepic acid', 'Rhodiola Rosea Extract', 'Ginseng Extract', 'Astragalus Root Extract'],
    ingredients: [
      { name: 'Cordyceps Sinensis Extract 7% cordycepic acid', amount: '', unit: '', dailyValue: '*' },
      { name: 'Rhodiola Rosea Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ginseng Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Astragalus Root Extract', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'energy-capsules',
    sku: 'DUR-C011',
    name: 'Energy Capsules',
    categoryId: 'energy-performance',
    description: 'Comprehensive energy and vitality blend with cordyceps, ginseng, and shilajit for sustained natural energy.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Cordyceps Sinensis Extract', 'Ginseng Extract 10% ginsenosides', 'Shilajit Extract 20% fulvic acid', 'Black Pepper Extract 5mg'],
    ingredients: [
      { name: 'Cordyceps Sinensis Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ginseng Extract 10% ginsenosides', amount: '', unit: '', dailyValue: '*' },
      { name: 'Shilajit Extract 20% fulvic acid', amount: '', unit: '', dailyValue: '*' },
      { name: 'Black Pepper Extract', amount: '5', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'maca-root',
    sku: 'DUR-C012',
    name: 'Maca Root',
    categoryId: 'energy-performance',
    description: 'Traditional Peruvian maca root extract with B vitamins and minerals to support energy, stamina, and hormonal balance.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Maca Root Extract 500mg', 'Vitamin B6 1.4mg', 'Vitamin B12 2.4mcg', 'Zinc 10mg', 'Magnesium 56mg'],
    ingredients: [
      { name: 'Maca Root Extract', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '1.4', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B12', amount: '2.4', unit: 'mcg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '56', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'turkesterone',
    sku: 'DUR-C013',
    name: 'Turkesterone',
    categoryId: 'energy-performance',
    description: 'Natural anabolic support with turkesterone, beta-ecdysterone, and adaptogenic herbs for muscle performance and recovery.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Turkesterone 500mg', 'Beta-Ecdysterone 200mg', 'Ashwagandha Extract 150mg', 'Rhodiola Rosea 100mg', 'Vitamin D3 1000 IU'],
    ingredients: [
      { name: 'Turkesterone', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Beta-Ecdysterone', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Ashwagandha Extract', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Rhodiola Rosea', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '1000', unit: 'IU', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'ecdysterone',
    sku: 'DUR-C014',
    name: 'Ecdysterone',
    categoryId: 'energy-performance',
    description: 'Proprietary strength and performance blend with ecdysterone, tribulus terrestris, ashwagandha, and rhodiola for athletic support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Ecdysterone 98%', 'Tribulus Terrestris', 'Ashwagandha', 'Rhodiola Rosea Extract'],
    ingredients: [
      { name: 'Ecdysterone 98%', amount: '', unit: '', dailyValue: '*' },
      { name: 'Tribulus Terrestris', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ashwagandha', amount: '', unit: '', dailyValue: '*' },
      { name: 'Rhodiola Rosea Extract', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // IMMUNITY & WELLNESS
  // ----------------------------------------
  {
    id: 'elderberry-immune',
    sku: 'DUR-C015',
    name: 'Elderberry Immune Support',
    categoryId: 'immunity-wellness',
    description: 'Powerful immune support blend with elderberry, vitamin C, zinc, echinacea, and astragalus for year-round wellness.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Elderberry Extract 500mg', 'Vitamin C', 'Zinc', 'Echinacea Extract', 'Astragalus Root Extract', 'Ginger Root Extract'],
    ingredients: [
      { name: 'Elderberry Extract', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '', unit: '', dailyValue: '*' },
      { name: 'Zinc', amount: '', unit: '', dailyValue: '*' },
      { name: 'Echinacea Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Astragalus Root Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ginger Root Extract', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'quercetin',
    sku: 'DUR-C016',
    name: 'Quercetin',
    categoryId: 'immunity-wellness',
    description: 'Potent antioxidant formula with quercetin, bromelain, and vitamin C for immune and respiratory support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Quercetin 500mg', 'Bromelain 100mg', 'Vitamin C 100mg', 'Black Pepper Extract 5mg'],
    ingredients: [
      { name: 'Quercetin', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Bromelain', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Black Pepper Extract', amount: '5', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'oil-of-oregano',
    sku: 'DUR-S001',
    name: 'Oil of Oregano',
    categoryId: 'immunity-wellness',
    description: 'High-potency oil of oregano with black seed oil for natural immune defense and antimicrobial support.',
    servingSize: '2 softgels',
    servingsPerContainer: 150,
    keyIngredients: ['Oil of Oregano 6,000mg (80% Carvacrol)', 'Black Seed Oil 200mg'],
    ingredients: [
      { name: 'Oil of Oregano', amount: '6000', unit: 'mg', dailyValue: '*', source: '(80% Carvacrol)' },
      { name: 'Black Seed Oil', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'softgels'
  },
  {
    id: 'vitamin-d3-k2',
    sku: 'DUR-S002',
    name: 'Vitamin D3 + K2 (MK-7)',
    categoryId: 'immunity-wellness',
    description: 'Synergistic vitamin D3 and K2 combination for immune health, calcium absorption, and cardiovascular support.',
    servingSize: '1 softgel',
    servingsPerContainer: 180,
    keyIngredients: ['Vitamin D3 5,000 IU', 'Vitamin K2 (MK-7) 100mcg'],
    ingredients: [
      { name: 'Vitamin D3', amount: '5000', unit: 'IU', dailyValue: '*' },
      { name: 'Vitamin K2 (MK-7)', amount: '100', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'softgels'
  },
  {
    id: 'sea-moss',
    sku: 'DUR-C017',
    name: 'Sea Moss Complex',
    categoryId: 'immunity-wellness',
    description: 'Traditional sea moss blend with bladderwrack and burdock root for mineral-rich immune and thyroid support.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Sea Moss 500mg', 'Bladderwrack Extract', 'Burdock Root Extract'],
    ingredients: [
      { name: 'Sea Moss', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Bladderwrack Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Burdock Root Extract', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'guava-immune',
    sku: 'DUR-C018',
    name: 'Graviola Immune Support',
    categoryId: 'immunity-wellness',
    description: 'Tropical graviola leaf extract with turmeric, echinacea, and vitamin C for antioxidant and immune support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Graviola Leaf Extract 400mg', 'Turmeric Root Extract 100mg', 'Echinacea Extract 100mg', 'Vitamin C 60mg'],
    ingredients: [
      { name: 'Graviola Leaf Extract', amount: '400', unit: 'mg', dailyValue: '*' },
      { name: 'Turmeric Root Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Echinacea Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // COGNITIVE SUPPORT
  // ----------------------------------------
  {
    id: 'brain-support',
    sku: 'DUR-C019',
    name: 'Brain Support Formula',
    categoryId: 'cognitive-support',
    description: 'Comprehensive cognitive formula with omega-3, ginkgo biloba, CoQ10, and vitamin B12 for brain health and mental clarity.',
    servingSize: '1 capsule',
    servingsPerContainer: 120,
    keyIngredients: ['Omega-3 Fish Oil 200mg', 'Ginkgo Biloba Extract 60mg', 'Coenzyme Q10 50mg', 'Vitamin B12 100mcg'],
    ingredients: [
      { name: 'Omega-3 Fish Oil', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Ginkgo Biloba Extract', amount: '60', unit: 'mg', dailyValue: '*' },
      { name: 'Coenzyme Q10', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B12', amount: '100', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'lions-mane',
    sku: 'DUR-C020',
    name: "Lion's Mane Mushroom",
    categoryId: 'cognitive-support',
    description: "Premium lion's mane mushroom extract standardized for beta-glucans to support brain health, focus, and memory.",
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ["Lion's Mane Mushroom Extract 500mg", 'Beta-(1,3)(1,6)-glucans >30%'],
    ingredients: [
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'lions-mane-cognitive',
    sku: 'DUR-C021',
    name: "Lion's Mane Cognitive Blend",
    categoryId: 'cognitive-support',
    description: "Enhanced lion's mane formula with ginkgo biloba, bacopa monnieri, and rhodiola for comprehensive cognitive support.",
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ["Lion's Mane Extract 30% polysaccharides", 'Ginkgo Biloba Extract', 'Bacopa Monnieri Extract', 'Rhodiola Rosea Extract'],
    ingredients: [
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'ginkgo-biloba',
    sku: 'DUR-C022',
    name: 'Ginkgo Biloba Complex',
    categoryId: 'cognitive-support',
    description: 'Traditional ginkgo biloba with bacopa, rhodiola, and L-theanine for enhanced memory, focus, and mental performance.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Ginkgo Biloba Extract 500mg', 'Bacopa Monnieri', 'Rhodiola Rosea Extract', 'L-Theanine 100mg'],
    ingredients: [
      { name: 'Ginkgo Biloba Extract', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Bacopa Monnieri', amount: '', unit: '', dailyValue: '*' },
      { name: 'Rhodiola Rosea Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Theanine', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'nootropic-blend',
    sku: 'DUR-C023',
    name: 'Nootropic Blend',
    categoryId: 'cognitive-support',
    description: 'Advanced nootropic formula with herbal extracts, resveratrol, curcumin, and CoQ10 for cognitive enhancement.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Proprietary Blend 1460mg (Acerola, Phellodendron, Urena, Astragalus, Fractionated Colostrum, Maca, Reishi)'],
    ingredients: [
      { name: 'Proprietary Blend', amount: '1460', unit: 'mg', dailyValue: '*', source: '(Acerola/Ascorbate Bioflavonoid Extract 25%, Phellodendron/Berberine Extract 20%, Urena lobata/Urena Hexidroxyflav Extract, Astragalus Polysaccharide 50%, Fractionated Colostrum (bovine whey), Maca Root Extract/Rosavins, Quercetin)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'brain-support-anagain',
    sku: 'DUR-C024',
    name: 'Brain Support with AnaGain',
    categoryId: 'cognitive-support',
    description: 'Comprehensive brain health formula with B-vitamins, AnaGain, choline, and zinc for cognitive function support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Vitamin C 50mg', 'B-Complex Vitamins', 'Choline 30mg', 'Zinc 20mg', 'AnaGain Nu 100mg', 'Inositol 30mg'],
    ingredients: [
      { name: 'Vitamin C', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'B-Complex Vitamins', amount: '', unit: '', dailyValue: '*' },
      { name: 'Choline', amount: '30', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'AnaGain Nu', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Inositol', amount: '30', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // DIGESTIVE HEALTH
  // ----------------------------------------
  {
    id: 'probiotic-digestive-enzyme',
    sku: 'DUR-C025',
    name: 'Probiotic + Digestive Enzyme',
    categoryId: 'digestive-health',
    description: 'Dual-action formula with beneficial probiotics, inulin prebiotic, and digestive enzymes for gut health.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Lactobacillus acidophilus 5 billion CFU', 'Bifidobacterium longum 5 billion CFU', 'Inulin 150mg', 'Digestive Enzyme Blend 100mg'],
    ingredients: [
      { name: 'Lactobacillus acidophilus', amount: '5', unit: 'billion CFU', dailyValue: '*' },
      { name: 'Bifidobacterium longum', amount: '5', unit: 'billion CFU', dailyValue: '*' },
      { name: 'Inulin', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Digestive Enzyme Blend', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'probiotic-inulin',
    sku: 'DUR-C026',
    name: 'Probiotic with Inulin',
    categoryId: 'digestive-health',
    description: 'Multi-strain probiotic with Saccharomyces boulardii and inulin prebiotic for comprehensive digestive support.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Lactobacillus rhamnosus 5 billion CFU', 'Bifidobacterium bifidum 5 billion CFU', 'Saccharomyces boulardii 3 billion CFU', 'Inulin 100mg'],
    ingredients: [
      { name: 'Lactobacillus rhamnosus', amount: '5', unit: 'billion CFU', dailyValue: '*' },
      { name: 'Bifidobacterium bifidum', amount: '5', unit: 'billion CFU', dailyValue: '*' },
      { name: 'Saccharomyces boulardii', amount: '3', unit: 'billion CFU', dailyValue: '*' },
      { name: 'Inulin', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'probiotic-women',
    sku: 'DUR-C027',
    name: 'Probiotic for Women',
    categoryId: 'digestive-health',
    description: 'Women-specific probiotic blend with cranberry extract, vitamin D3, and prebiotic fiber for digestive and urinary health.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Probiotic Blend 20 Billion CFU', 'Prebiotic Fiber 100mg', 'Cranberry Extract 100mg', 'Vitamin D3 25mcg', 'Folic Acid 400mcg'],
    ingredients: [
      { name: 'Probiotic Blend', amount: '20', unit: 'Billion CFU', dailyValue: '*' },
      { name: 'Prebiotic Fiber', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Cranberry Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '25', unit: 'mcg', dailyValue: '*' },
      { name: 'Folic Acid', amount: '400', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'intestinal-cleanse',
    sku: 'DUR-C028',
    name: 'Intestinal Cleanse',
    categoryId: 'digestive-health',
    description: 'Gentle digestive cleanse with senna, psyllium husk, aloe vera, and soothing herbs for regularity support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Senna Leaf Extract 200mg', 'Psyllium Husk 200mg', 'Aloe Vera Extract 50mg', 'Fennel Seed Extract 35mg', 'Ginger Root Extract 35mg'],
    ingredients: [
      { name: 'Senna Leaf Extract', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Psyllium Husk', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Aloe Vera Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Fennel Seed Extract', amount: '35', unit: 'mg', dailyValue: '*' },
      { name: 'Ginger Root Extract', amount: '35', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // MULTIVITAMINS
  // ----------------------------------------
  {
    id: 'multivitamin-greens',
    sku: 'DUR-C029',
    name: 'Multivitamin with Greens Blend',
    categoryId: 'multivitamins',
    description: 'Complete daily multivitamin with whole food greens blend for comprehensive nutritional support.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Vitamin A 120mcg', 'Vitamin C 120mg', 'Vitamin D3 20mcg', 'Iron 14.5mg', 'Biotin 600mcg', 'Proprietary Greens Blend 359mg'],
    ingredients: [
      { name: 'Vitamin A', amount: '120', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '120', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '20', unit: 'mcg', dailyValue: '*' },
      { name: 'Iron', amount: '14.5', unit: 'mg', dailyValue: '*' },
      { name: 'Biotin', amount: '600', unit: 'mcg', dailyValue: '*' },
      { name: 'Proprietary Greens Blend', amount: '359', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'multivitamin-probiotic',
    sku: 'DUR-C030',
    name: 'Multivitamin with Probiotic Complex',
    categoryId: 'multivitamins',
    description: 'Advanced multivitamin featuring probiotics, antioxidants, and botanical extracts for total body wellness.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Vitamin A 400mcg', 'Vitamin D3 25mcg', 'Vitamin C 12mg', 'Zinc 4mg', 'Chromium 400mcg', 'Probiotic Blend 10 Billion CFU'],
    ingredients: [
      { name: 'Vitamin A', amount: '400', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '25', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '12', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '4', unit: 'mg', dailyValue: '*' },
      { name: 'Chromium', amount: '400', unit: 'mcg', dailyValue: '*' },
      { name: 'Probiotic Blend', amount: '10', unit: 'Billion CFU', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'womens-multivitamin',
    sku: 'DUR-C031',
    name: "Women's Multivitamin",
    categoryId: 'multivitamins',
    description: "Comprehensive multivitamin designed for women's unique nutritional needs with iron, calcium, folate, and essential vitamins.",
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Vitamin A 120mcg', 'Vitamin C 120mg', 'Iron 14.5mg', 'Folate 1,467mcg DFE', 'Vitamin B12 12mcg', 'Magnesium 120mg'],
    ingredients: [
      { name: 'Vitamin A', amount: '120', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '120', unit: 'mg', dailyValue: '*' },
      { name: 'Iron', amount: '14.5', unit: 'mg', dailyValue: '*' },
      { name: 'Folate 1,467mcg DFE', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin B12', amount: '12', unit: 'mcg', dailyValue: '*' },
      { name: 'Magnesium', amount: '120', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'mens-multivitamin',
    sku: 'DUR-C032',
    name: "Men's Multivitamin",
    categoryId: 'multivitamins',
    description: "Complete daily multivitamin formulated for men's health with vitamins, minerals, saw palmetto, and performance herbs.",
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin A 900mcg', 'Vitamin C 90mg', 'Vitamin D3 50mcg', 'Magnesium 420mg', 'Zinc 11mg', 'Saw Palmetto Extract', 'Ginseng'],
    ingredients: [
      { name: 'Vitamin A', amount: '900', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '90', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '50', unit: 'mcg', dailyValue: '*' },
      { name: 'Magnesium', amount: '420', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '11', unit: 'mg', dailyValue: '*' },
      { name: 'Saw Palmetto Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ginseng', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'moringa',
    sku: 'DUR-C033',
    name: 'Moringa Superfood',
    categoryId: 'multivitamins',
    description: 'Nutrient-dense moringa leaf powder with turmeric, ginger, spirulina, and essential vitamins for whole-body nutrition.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Moringa Leaf Powder 600mg', 'Turmeric Extract 100mg', 'Ginger Root Extract 50mg', 'Spirulina Powder 100mg', 'Vitamin C 60mg'],
    ingredients: [
      { name: 'Moringa Leaf Powder', amount: '600', unit: 'mg', dailyValue: '*' },
      { name: 'Turmeric Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Ginger Root Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Spirulina Powder', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // MEN'S HEALTH
  // ----------------------------------------
  {
    id: 'mens-vitality',
    sku: 'DUR-C034',
    name: "Men's Vitality Formula",
    categoryId: 'mens-health',
    description: 'Traditional herbs for male vitality including maca, shilajit, L-arginine, and muira puama.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Maca 250mg', 'Shilajit 110mg', 'L-Arginine 40mg', 'Muira Puama 50mg'],
    ingredients: [
      { name: 'Maca', amount: '250', unit: 'mg', dailyValue: '*' },
      { name: 'Shilajit', amount: '110', unit: 'mg', dailyValue: '*' },
      { name: 'L-Arginine', amount: '40', unit: 'mg', dailyValue: '*' },
      { name: 'Muira Puama', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'male-enhancement',
    sku: 'DUR-C035',
    name: 'Male Enhancement Blend',
    categoryId: 'mens-health',
    description: 'Proprietary blend of horny goat weed, maca root, and L-arginine for male performance support.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Proprietary Blend 420mg (Horny Goat Weed, Maca Root Extract, L-Arginine)'],
    ingredients: [
      { name: 'Proprietary Blend', amount: '420', unit: 'mg', dailyValue: '*', source: '(Horny Goat Weed, Maca Root Extract, L-Arginine)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'saw-palmetto',
    sku: 'DUR-C036',
    name: 'Saw Palmetto Complex',
    categoryId: 'mens-health',
    description: 'Comprehensive prostate support with saw palmetto, pumpkin seed, nettle root, pygeum, and zinc.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Saw Palmetto Extract', 'Pumpkin Seed Extract', 'Nettle Root Extract', 'Pygeum Bark Extract', 'Zinc'],
    ingredients: [
      { name: 'Saw Palmetto Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Pumpkin Seed Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Nettle Root Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Pygeum Bark Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Zinc', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'prostate-health',
    sku: 'DUR-C037',
    name: 'SNAP Prostate Health Blend',
    categoryId: 'mens-health',
    description: 'Advanced prostate formula with mushroom blend, saw palmetto, plant sterols, and antioxidants for comprehensive prostate support.',
    servingSize: '3 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin C 27mg', 'Magnesium 60mg', 'Zinc 11mg', 'Selenium 55mcg', 'Prostate Support Mushroom Blend 900mg', 'Urinary Support Blend 600mg'],
    ingredients: [
      { name: 'Vitamin C', amount: '27', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '60', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '11', unit: 'mg', dailyValue: '*' },
      { name: 'Selenium', amount: '55', unit: 'mcg', dailyValue: '*' },
      { name: 'Prostate Support Mushroom Blend', amount: '900', unit: 'mg', dailyValue: '*' },
      { name: 'Urinary Support Blend', amount: '600', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'tongkat-ali',
    sku: 'DUR-C038',
    name: 'Tongkat Ali',
    categoryId: 'mens-health',
    description: 'Traditional Southeast Asian tongkat ali with maca, panax ginseng, and essential minerals for male vitality.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Tongkat Ali Extract 200mg', 'Maca Root Extract 100mg', 'Panax Ginseng Extract 50mg', 'Zinc 10mg', 'Magnesium 50mg'],
    ingredients: [
      { name: 'Tongkat Ali Extract', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Maca Root Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Panax Ginseng Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'shilajit',
    sku: 'DUR-C039',
    name: 'Shilajit Complex',
    categoryId: 'mens-health',
    description: 'Himalayan shilajit extract with ashwagandha, ginseng, and vitamin D3 for energy, stamina, and vitality.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Shilajit Extract 500mg', 'Ashwagandha Extract 150mg', 'Panax Ginseng Extract 100mg', 'Zinc 10mg', 'Vitamin D3 800 IU'],
    ingredients: [
      { name: 'Shilajit Extract', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Ashwagandha Extract', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Panax Ginseng Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '800', unit: 'IU', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'tribulus-terrestris',
    sku: 'DUR-C040',
    name: 'Tribulus Terrestris',
    categoryId: 'mens-health',
    description: 'High-potency tribulus terrestris with maca, horny goat weed, and fenugreek for athletic and male health support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Tribulus Terrestris Extract 700mg (45% saponins)', 'Maca Root Extract 100mg', 'Horny Goat Weed Extract 100mg', 'Fenugreek 50mg'],
    ingredients: [
      { name: 'Tribulus Terrestris Extract', amount: '700', unit: 'mg', dailyValue: '*', source: '(45% saponins)' },
      { name: 'Maca Root Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Horny Goat Weed Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Fenugreek', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // WOMEN'S HEALTH
  // ----------------------------------------
  {
    id: 'womens-hormonal-balance',
    sku: 'DUR-C041',
    name: "Women's Hormonal Balance",
    categoryId: 'womens-health',
    description: 'Natural support for hormonal balance with black cohosh, red clover, soy isoflavones, and vitamin E.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Black Cohosh Extract 100mg', 'Red Clover Extract 80mg', 'Soy Isoflavones 50mg', 'Vitamin E 15mg'],
    ingredients: [
      { name: 'Black Cohosh Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Red Clover Extract', amount: '80', unit: 'mg', dailyValue: '*' },
      { name: 'Soy Isoflavones', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '15', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'womens-wellness',
    sku: 'DUR-C042',
    name: "Women's Wellness Formula",
    categoryId: 'womens-health',
    description: 'Comprehensive formula with chasteberry, evening primrose oil, and DIM for menstrual and hormonal support.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Chasteberry Extract 200mg', 'Evening Primrose Oil 100mg', 'Vitamin B6 20mg', 'Diindolylmethane (DIM) 50mg'],
    ingredients: [
      { name: 'Chasteberry Extract', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Evening Primrose Oil', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Diindolylmethane (DIM)', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'inositol',
    sku: 'DUR-C043',
    name: 'Inositol Complex',
    categoryId: 'womens-health',
    description: 'High-potency inositol with choline, B vitamins, and minerals to support hormonal health and mood balance.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Inositol 600mg', 'Choline Bitartrate 100mg', 'Folic Acid 400mcg', 'Vitamin B6 5mg', 'Zinc 10mg', 'Magnesium 50mg'],
    ingredients: [
      { name: 'Inositol', amount: '600', unit: 'mg', dailyValue: '*' },
      { name: 'Choline Bitartrate', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Folic Acid', amount: '400', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // WEIGHT MANAGEMENT
  // ----------------------------------------
  {
    id: 'weight-management',
    sku: 'DUR-C044',
    name: 'Weight Management Support',
    categoryId: 'weight-management',
    description: 'Proprietary thermogenic blend with green tea, garcinia cambogia, glucomannan, and metabolism-boosting ingredients.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Proprietary Blend 800mg (Green Tea Extract, Garcinia Cambogia, Glucomannan, CLA, Cayenne, L-Carnitine)', 'Chromium Picolinate 50mg'],
    ingredients: [
      { name: 'Proprietary Blend', amount: '800', unit: 'mg', dailyValue: '*', source: '(Green Tea Extract, Garcinia Cambogia, Glucomannan, CLA, Cayenne, L-Carnitine)' },
      { name: 'Chromium Picolinate', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'fat-burner',
    sku: 'DUR-C045',
    name: 'Fat Burner',
    categoryId: 'weight-management',
    description: 'Metabolism-boosting formula with garcinia cambogia, L-carnitine, chromium, and forskolin for weight management.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Garcinia Cambogia Extract 200mg (60% HCA)', 'L-Carnitine 150mg', 'Chromium 200mcg', 'Forskolin 100mg'],
    ingredients: [
      { name: 'Garcinia Cambogia Extract', amount: '200', unit: 'mg', dailyValue: '*', source: '(60% HCA)' },
      { name: 'L-Carnitine', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Chromium', amount: '200', unit: 'mcg', dailyValue: '*' },
      { name: 'Forskolin', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'garcinia-cambogia',
    sku: 'DUR-C046',
    name: 'Garcinia Cambogia',
    categoryId: 'weight-management',
    description: 'Garcinia cambogia extract with green tea, chromium, and potassium for appetite control and metabolism support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Garcinia Cambogia Extract 500mg (60% HCA)', 'Green Tea Extract 200mg', 'Chromium Picolinate 100mcg', 'Potassium 50mg'],
    ingredients: [
      { name: 'Garcinia Cambogia Extract', amount: '500', unit: 'mg', dailyValue: '*', source: '(60% HCA)' },
      { name: 'Green Tea Extract', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Chromium Picolinate', amount: '100', unit: 'mcg', dailyValue: '*' },
      { name: 'Potassium', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'l-carnitine',
    sku: 'DUR-C047',
    name: 'L-Carnitine',
    categoryId: 'weight-management',
    description: 'Essential amino acid L-carnitine with green tea, garcinia cambogia, and B6 for fat metabolism and energy.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['L-Carnitine 500mg', 'Green Tea Extract 100mg', 'Garcinia Cambogia Extract 50mg', 'Vitamin B6 2mg'],
    ingredients: [
      { name: 'L-Carnitine', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Green Tea Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Garcinia Cambogia Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '2', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'slimming-capsules',
    sku: 'DUR-C048',
    name: 'Slimming Formula',
    categoryId: 'weight-management',
    description: 'Comprehensive weight support with decaffeinated green tea, garcinia, glucomannan, CLA, and L-carnitine.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Green Tea Extract (90% EGCG, decaf)', 'Garcinia Cambogia 60% HCA', 'Glucomannan', 'CLA', 'L-Carnitine', 'Chromium 100mcg'],
    ingredients: [
      { name: 'Green Tea Extract (90% EGCG, decaf)', amount: '', unit: '', dailyValue: '*' },
      { name: 'Garcinia Cambogia 60% HCA', amount: '', unit: '', dailyValue: '*' },
      { name: 'Glucomannan', amount: '', unit: '', dailyValue: '*' },
      { name: 'CLA', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Carnitine', amount: '', unit: '', dailyValue: '*' },
      { name: 'Chromium', amount: '100', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'keto-bhb',
    sku: 'DUR-C049',
    name: 'Keto BHB',
    categoryId: 'weight-management',
    description: 'Exogenous ketone formula with BHB salts, MCT oil powder, and metabolism-boosting extracts for ketogenic support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['BHB Salts (Calcium, Magnesium, Sodium)', 'MCT Oil Powder', 'Green Tea Extract', 'Cayenne Pepper Extract'],
    ingredients: [
      { name: 'BHB Salts (Calcium, Magnesium, Sodium)', amount: '', unit: '', dailyValue: '*' },
      { name: 'MCT Oil Powder', amount: '', unit: '', dailyValue: '*' },
      { name: 'Green Tea Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Cayenne Pepper Extract', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'bhb-ketone',
    sku: 'DUR-C050',
    name: 'BHB Ketone Supplement',
    categoryId: 'weight-management',
    description: 'Pure beta-hydroxybutyrate salts for ketosis support and mental clarity during low-carb dieting.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Magnesium Beta Hydroxybutyrate', 'Calcium Beta Hydroxybutyrate', 'Sodium Beta Hydroxybutyrate'],
    ingredients: [
      { name: 'Magnesium Beta Hydroxybutyrate', amount: '', unit: '', dailyValue: '*' },
      { name: 'Calcium Beta Hydroxybutyrate', amount: '', unit: '', dailyValue: '*' },
      { name: 'Sodium Beta Hydroxybutyrate', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // HEART & CARDIOVASCULAR
  // ----------------------------------------
  {
    id: 'l-carnitine-coq10',
    sku: 'DUR-C051',
    name: 'L-Carnitine + CoQ10',
    categoryId: 'heart-health',
    description: 'Heart-healthy combination of L-carnitine tartrate and CoQ10 for cardiovascular and energy support.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['L-Carnitine (as L-Carnitine Tartrate) 1000mg', 'Coenzyme Q10 200mg'],
    ingredients: [
      { name: 'L-Carnitine (as L-Carnitine Tartrate)', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'Coenzyme Q10', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'heart-health-complex',
    sku: 'DUR-C052',
    name: 'Heart Health Complex',
    categoryId: 'heart-health',
    description: 'Comprehensive cardiovascular formula with magnesium, L-carnitine, CoQ10, and rhodiola for heart health.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Magnesium Citrate 100mg', 'L-Carnitine 200mg', 'Coenzyme Q10 100mg', 'Rhodiola Rosea Extract 150mg'],
    ingredients: [
      { name: 'Magnesium', amount: '100', unit: 'mg', dailyValue: '*', source: '(as Magnesium Citrate)' },
      { name: 'L-Carnitine', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Coenzyme Q10', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Rhodiola Rosea Extract', amount: '150', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'coq10',
    sku: 'DUR-C053',
    name: 'Coenzyme Q10',
    categoryId: 'heart-health',
    description: 'High-potency CoQ10 with vitamin E, L-carnitine, omega-3, and antioxidants for heart and cellular energy support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Coenzyme Q10 200mg', 'Vitamin E 30mg', 'L-Carnitine 150mg', 'Omega-3 Fish Oil 300mg', 'Alpha-Lipoic Acid 50mg'],
    ingredients: [
      { name: 'Coenzyme Q10', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '30', unit: 'mg', dailyValue: '*' },
      { name: 'L-Carnitine', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Omega-3 Fish Oil', amount: '300', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha-Lipoic Acid', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'nattokinase',
    sku: 'DUR-C054',
    name: 'Nattokinase Cardiovascular',
    categoryId: 'heart-health',
    description: 'Proprietary cardiovascular blend with nattokinase, grape seed, hawthorn berry, CoQ10, and vitamin K2.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Nattokinase 2000 FU', 'Grape Seed Extract', 'Hawthorn Berry Extract', 'Coenzyme Q10', 'Garlic Extract', 'Vitamin K2 90mcg'],
    ingredients: [
      { name: 'Nattokinase 2000 FU', amount: '', unit: '', dailyValue: '*' },
      { name: 'Grape Seed Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Hawthorn Berry Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Coenzyme Q10', amount: '', unit: '', dailyValue: '*' },
      { name: 'Garlic Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin K2', amount: '90', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'l-arginine',
    sku: 'DUR-C055',
    name: 'L-Arginine',
    categoryId: 'heart-health',
    description: 'L-arginine with L-citrulline, pine bark extract, and folate for nitric oxide production and cardiovascular health.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['L-Arginine 500mg', 'L-Citrulline 200mg', 'Pine Bark Extract 100mg', 'Vitamin C 60mg', 'Folate 400mcg'],
    ingredients: [
      { name: 'L-Arginine', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'L-Citrulline', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Pine Bark Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' },
      { name: 'Folate', amount: '400', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'beet-root',
    sku: 'DUR-C056',
    name: 'Beet Root',
    categoryId: 'heart-health',
    description: 'Nitrate-rich beet root extract with L-arginine and essential minerals for blood pressure and circulation support.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Beet Root Extract 500mg', 'L-Arginine 200mg', 'Vitamin C 60mg', 'Magnesium 50mg', 'Potassium 20mg'],
    ingredients: [
      { name: 'Beet Root Extract', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'L-Arginine', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Potassium', amount: '20', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // JOINT & BONE SUPPORT
  // ----------------------------------------
  {
    id: 'bone-joint-support',
    sku: 'DUR-C057',
    name: 'Bone & Joint Support',
    categoryId: 'joint-bone',
    description: 'Comprehensive formula with calcium, vitamin D3, magnesium, and collagen for bone density and joint health.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Calcium Citrate 600mg', 'Vitamin D3 2000 IU', 'Magnesium Glycinate 200mg', 'Collagen Type II 200mg'],
    ingredients: [
      { name: 'Calcium', amount: '600', unit: 'mg', dailyValue: '*', source: '(as Calcium Citrate)' },
      { name: 'Vitamin D3', amount: '2000', unit: 'IU', dailyValue: '*' },
      { name: 'Magnesium', amount: '200', unit: 'mg', dailyValue: '*', source: '(as Magnesium Glycinate)' },
      { name: 'Collagen Type II', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'joint-support',
    sku: 'DUR-C058',
    name: 'Joint Support Formula',
    categoryId: 'joint-bone',
    description: 'Classic joint formula with glucosamine, chondroitin, and MSM for cartilage health and mobility.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Glucosamine Sulfate 1000mg', 'Chondroitin Sulfate 400mg', 'MSM 200mg'],
    ingredients: [
      { name: 'Glucosamine Sulfate', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'Chondroitin Sulfate', amount: '400', unit: 'mg', dailyValue: '*' },
      { name: 'MSM', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'joint-support-advanced',
    sku: 'DUR-T001',
    name: 'Joint Support Advanced',
    categoryId: 'joint-bone',
    description: 'Enhanced joint formula with glucosamine, chondroitin, hyaluronic acid, and calcium fructoborate.',
    servingSize: '2 tablets',
    servingsPerContainer: 100,
    keyIngredients: ['Glucosamine Hydrochloride 1500mg', 'Chondroitin Sulfate Sodium 200mg', 'Hyaluronic Acid 3.3mg', 'Calcium Fructoborate 216mg'],
    ingredients: [
      { name: 'Glucosamine Hydrochloride', amount: '1500', unit: 'mg', dailyValue: '*' },
      { name: 'Chondroitin Sulfate Sodium', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Hyaluronic Acid', amount: '3.3', unit: 'mg', dailyValue: '*' },
      { name: 'Calcium Fructoborate', amount: '216', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'tablets'
  },
  {
    id: 'turmeric-joint',
    sku: 'DUR-C059',
    name: 'Turmeric Joint Support',
    categoryId: 'joint-bone',
    description: 'Anti-inflammatory blend with turmeric curcuminoids, ginger, boswellia, and vitamin D3 for joint comfort.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Turmeric Extract 500mg (95% curcuminoids)', 'Ginger Root Extract 100mg', 'Boswellia Serrata 100mg', 'Vitamin D3 25mcg'],
    ingredients: [
      { name: 'Turmeric Extract', amount: '500', unit: 'mg', dailyValue: '*', source: '(95% curcuminoids)' },
      { name: 'Ginger Root Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Boswellia Serrata', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '25', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // LIVER & DETOX
  // ----------------------------------------
  {
    id: 'liver-support',
    sku: 'DUR-C060',
    name: 'Liver Support Complex',
    categoryId: 'liver-detox',
    description: 'Comprehensive liver support with milk thistle, NAC, schisandra, and magnesium for detoxification.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Magnesium Citrate 100mg', 'Milk Thistle Extract 200mg (80% Silymarin)', 'NAC 150mg', 'Schisandra Extract 100mg'],
    ingredients: [
      { name: 'Magnesium', amount: '100', unit: 'mg', dailyValue: '*', source: '(as Magnesium Citrate)' },
      { name: 'Milk Thistle Extract', amount: '200', unit: 'mg', dailyValue: '*', source: '(80% Silymarin)' },
      { name: 'NAC', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Schisandra Extract', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'milk-thistle',
    sku: 'DUR-C061',
    name: 'Milk Thistle Complex',
    categoryId: 'liver-detox',
    description: 'Proprietary liver detox blend with milk thistle, dandelion root, artichoke, and turmeric for liver health.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Milk Thistle Extract 500mg', 'Dandelion Root', 'Artichoke Leaf Extract', 'Turmeric Root Extract'],
    ingredients: [
      { name: 'Milk Thistle Extract', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Dandelion Root', amount: '', unit: '', dailyValue: '*' },
      { name: 'Artichoke Leaf Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Turmeric Root Extract', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'nac',
    sku: 'DUR-C062',
    name: 'NAC (N-Acetyl L-Cysteine)',
    categoryId: 'liver-detox',
    description: 'Powerful antioxidant NAC with vitamin C, vitamin E, selenium, and zinc for glutathione production and detox support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['N-Acetyl L-Cysteine 600mg', 'Vitamin C 120mg', 'Vitamin E 15mg', 'Selenium 55mcg', 'Zinc 10mg'],
    ingredients: [
      { name: 'N-Acetyl L-Cysteine', amount: '600', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '120', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '15', unit: 'mg', dailyValue: '*' },
      { name: 'Selenium', amount: '55', unit: 'mcg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'glutathione',
    sku: 'DUR-C063',
    name: 'Glutathione',
    categoryId: 'liver-detox',
    description: 'Master antioxidant glutathione with vitamin C, alpha lipoic acid, and selenium for cellular protection and detox.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Glutathione 250mg', 'Vitamin C 150mg', 'Alpha Lipoic Acid 50mg', 'Selenium 55mcg', 'Zinc 10mg'],
    ingredients: [
      { name: 'Glutathione', amount: '250', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha Lipoic Acid', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Selenium', amount: '55', unit: 'mcg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'detox-capsules',
    sku: 'DUR-C064',
    name: 'Detox Capsules',
    categoryId: 'liver-detox',
    description: 'Comprehensive detox support with CLA, L-carnitine, omega-3, alpha lipoic acid, and turmeric.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Conjugated Linoleic Acid 300mg', 'Vitamin E 30mg', 'L-Carnitine 120mg', 'Omega-3 Fish Oil 300mg', 'Alpha-Lipoic Acid 50mg', 'Turmeric Extract 50mg'],
    ingredients: [
      { name: 'Conjugated Linoleic Acid', amount: '300', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '30', unit: 'mg', dailyValue: '*' },
      { name: 'L-Carnitine', amount: '120', unit: 'mg', dailyValue: '*' },
      { name: 'Omega-3 Fish Oil', amount: '300', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha-Lipoic Acid', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Turmeric Extract', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'chlorophyll',
    sku: 'DUR-C065',
    name: 'Chlorophyll Complex',
    categoryId: 'liver-detox',
    description: 'Natural detox with chlorophyll, spirulina, alfalfa, peppermint, and dandelion root for internal cleansing.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Chlorophyll 100mg', 'Spirulina Powder 100mg', 'Alfalfa Powder 100mg', 'Peppermint Leaf Extract 50mg', 'Dandelion Root Extract 50mg'],
    ingredients: [
      { name: 'Chlorophyll', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Spirulina Powder', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Alfalfa Powder', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Peppermint Leaf Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Dandelion Root Extract', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'berberine',
    sku: 'DUR-C066',
    name: 'Berberine',
    categoryId: 'liver-detox',
    description: 'Berberine HCL with milk thistle, alpha lipoic acid, and chromium for metabolic and liver support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Berberine HCL 500mg', 'Milk Thistle Extract 100mg', 'Alpha Lipoic Acid 50mg', 'Chromium Picolinate 100mcg', 'Artichoke Leaf Extract 50mg'],
    ingredients: [
      { name: 'Berberine HCL', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Milk Thistle Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha Lipoic Acid', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Chromium Picolinate', amount: '100', unit: 'mcg', dailyValue: '*' },
      { name: 'Artichoke Leaf Extract', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // HAIR, SKIN & NAILS (BEAUTY)
  // ----------------------------------------
  {
    id: 'hair-skin-nails',
    sku: 'DUR-C067',
    name: 'Hair, Skin & Nails Formula',
    categoryId: 'beauty',
    description: 'Comprehensive beauty formula with biotin, zinc, iron, vitamin D3, bamboo silica, and saw palmetto.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Biotin 20mg', 'Zinc 20mg', 'Iron 8mg', 'Vitamin D3 1000 IU', 'Bamboo Extract (70% Silica) 400mg', 'Saw Palmetto Extract 320mg'],
    ingredients: [
      { name: 'Biotin', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Iron', amount: '8', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '1000', unit: 'IU', dailyValue: '*' },
      { name: 'Bamboo Extract (70% Silica)', amount: '400', unit: 'mg', dailyValue: '*' },
      { name: 'Saw Palmetto Extract', amount: '320', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'hair-growth',
    sku: 'DUR-C068',
    name: 'Hair Growth Formula',
    categoryId: 'beauty',
    description: 'Advanced hair support with high-potency biotin, vitamin D3, MSM, and proprietary botanical blend.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Biotin 6,000mcg', 'Vitamin D3 1,000 IU', 'Vitamin E 50mg', 'Zinc 10mg', 'MSM 400mg', 'Proprietary Blend 650mg'],
    ingredients: [
      { name: 'Biotin', amount: '6000', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '1000', unit: 'IU', dailyValue: '*' },
      { name: 'Vitamin E', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'MSM', amount: '400', unit: 'mg', dailyValue: '*' },
      { name: 'Proprietary Blend', amount: '650', unit: 'mg', dailyValue: '*', source: '(Contact for full ingredient list)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'hair-care',
    sku: 'DUR-C069',
    name: 'Hair Care Complex',
    categoryId: 'beauty',
    description: 'Proprietary hair care blend with biotin, collagen peptides, saw palmetto, horsetail, and MSM.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Biotin 300mcg', 'Collagen Peptides', 'Saw Palmetto Extract', 'Horsetail Extract (7% silica)', 'MSM 200mg', 'Zinc 10mg'],
    ingredients: [
      { name: 'Biotin', amount: '300', unit: 'mcg', dailyValue: '*' },
      { name: 'Collagen Peptides', amount: '', unit: '', dailyValue: '*' },
      { name: 'Saw Palmetto Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Horsetail Extract (7% silica)', amount: '', unit: '', dailyValue: '*' },
      { name: 'MSM', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'biotin',
    sku: 'DUR-C070',
    name: 'Biotin',
    categoryId: 'beauty',
    description: 'High-potency biotin with horsetail silica, collagen peptides, and essential vitamins for hair, skin, and nail health.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Biotin 5,000mcg', 'Horsetail Extract (7% silica) 100mg', 'Collagen Peptides 200mg', 'Zinc 10mg', 'Vitamin C 60mg'],
    ingredients: [
      { name: 'Biotin', amount: '5000', unit: 'mcg', dailyValue: '*' },
      { name: 'Horsetail Extract (7% silica)', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Collagen Peptides', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'bakuchiol',
    sku: 'DUR-C071',
    name: 'Bakuchiol Beauty',
    categoryId: 'beauty',
    description: 'Plant-based retinol alternative with bakuchiol, vitamin E, hyaluronic acid, and biotin for anti-aging skin support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Bakuchiol Extract 10mg', 'Vitamin E 10 IU', 'Sodium Hyaluronate 5mg', 'Biotin 300mcg', 'Glucosamine Sulfate 50mg'],
    ingredients: [
      { name: 'Bakuchiol Extract', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '10', unit: 'IU', dailyValue: '*' },
      { name: 'Sodium Hyaluronate', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'Biotin', amount: '300', unit: 'mcg', dailyValue: '*' },
      { name: 'Glucosamine Sulfate', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // EYE HEALTH
  // ----------------------------------------
  {
    id: 'eye-health',
    sku: 'DUR-C072',
    name: 'Eye Health Formula',
    categoryId: 'eye-health',
    description: 'Vision support with lutein, zeaxanthin, vitamin C, and zinc for macular health and eye protection.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Vitamin C 100mg', 'Zinc Citrate 15mg', 'Lutein 10mg', 'Zeaxanthin 2mg'],
    ingredients: [
      { name: 'Vitamin C', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '15', unit: 'mg', dailyValue: '*', source: '(as Zinc Citrate)' },
      { name: 'Lutein', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Zeaxanthin', amount: '2', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'lutein-vision',
    sku: 'DUR-C073',
    name: 'Lutein Eye Support',
    categoryId: 'eye-health',
    description: 'High-potency lutein with zeaxanthin, vitamin C, vitamin E, bilberry, and selenium for comprehensive eye care.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Lutein 20mg', 'Zeaxanthin 4mg', 'Vitamin C 90mg', 'Vitamin E 30 IU', 'Bilberry Extract 50mg', 'Selenium 55mcg'],
    ingredients: [
      { name: 'Lutein', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Zeaxanthin', amount: '4', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '90', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '30', unit: 'IU', dailyValue: '*' },
      { name: 'Bilberry Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Selenium', amount: '55', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'astaxanthin',
    sku: 'DUR-C074',
    name: 'Astaxanthin',
    categoryId: 'eye-health',
    description: 'Powerful carotenoid antioxidant astaxanthin with lutein, zeaxanthin, and vitamin E for eye and skin protection.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Astaxanthin 12mg', 'Vitamin E 15mg', 'Vitamin C 60mg', 'Alpha-Lipoic Acid 50mg', 'Lutein 6mg', 'Zeaxanthin 2mg'],
    ingredients: [
      { name: 'Astaxanthin', amount: '12', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '15', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha-Lipoic Acid', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Lutein', amount: '6', unit: 'mg', dailyValue: '*' },
      { name: 'Zeaxanthin', amount: '2', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // MUSHROOM EXTRACTS
  // ----------------------------------------
  {
    id: 'mixed-mushroom',
    sku: 'DUR-C075',
    name: 'Mixed Mushroom Complex',
    categoryId: 'mushrooms',
    description: 'Five-mushroom blend with reishi, lion\'s mane, cordyceps, chaga, and shiitake for comprehensive immune and energy support.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Reishi Mushroom Extract', "Lion's Mane Mushroom Extract", 'Cordyceps Mushroom Extract', 'Chaga Mushroom Extract', 'Shiitake Mushroom Extract'],
    ingredients: [
      { name: 'Reishi Mushroom Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // SPECIALTY FORMULAS
  // ----------------------------------------
  {
    id: 'migraine-relief',
    sku: 'DUR-C076',
    name: 'Migraine Relief Formula',
    categoryId: 'specialty-formulas',
    description: 'Targeted support for occasional headaches with vitamin B6, magnesium, and L-citrulline.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Vitamin B6 10mg', 'Magnesium Oxide 80mg', 'L-Citrulline 150mg'],
    ingredients: [
      { name: 'Vitamin B6', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '80', unit: 'mg', dailyValue: '*', source: '(as Magnesium Oxide)' },
      { name: 'L-Citrulline', amount: '150', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'kidney-support',
    sku: 'DUR-C077',
    name: 'Kidney Support',
    categoryId: 'specialty-formulas',
    description: 'Herbal kidney health formula with bacopa, hawthorn berry, magnesium L-threonate, and vitamin B6.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Bacopa Monnieri Extract 150mg', 'Hawthorn Berry Extract 100mg', 'Magnesium L-Threonate 50mg', 'Vitamin B6 10mg'],
    ingredients: [
      { name: 'Bacopa Monnieri Extract', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Hawthorn Berry Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*', source: '(as Magnesium L-Threonate)' },
      { name: 'Vitamin B6', amount: '10', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'blood-sugar-support',
    sku: 'DUR-C078',
    name: 'Blood Sugar Support',
    categoryId: 'specialty-formulas',
    description: 'Metabolic support formula with chromium, EGCG from green tea, and black cumin seed for healthy blood sugar.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin B12 2.4mcg', 'Chromium Picolinate 600mcg', 'EGCG from Green Tea 270mg', 'Black Cumin Seed Extract 200mg'],
    ingredients: [
      { name: 'Vitamin B12', amount: '2.4', unit: 'mcg', dailyValue: '*' },
      { name: 'Chromium Picolinate', amount: '600', unit: 'mcg', dailyValue: '*' },
      { name: 'EGCG from Green Tea', amount: '270', unit: 'mg', dailyValue: '*' },
      { name: 'Black Cumin Seed Extract', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'pumpkin-seed-oil',
    sku: 'DUR-S003',
    name: 'Pumpkin Seed Oil',
    categoryId: 'specialty-formulas',
    description: 'Organic cold-pressed pumpkin seed oil for prostate, bladder, and urinary tract support.',
    servingSize: '3 softgels',
    servingsPerContainer: 60,
    keyIngredients: ['Organic Pumpkin Seed Oil 3,000mg'],
    ingredients: [
      { name: 'Organic Pumpkin Seed Oil', amount: '3000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'softgels'
  },
  {
    id: 'spermidine',
    sku: 'DUR-C079',
    name: 'Spermidine',
    categoryId: 'specialty-formulas',
    description: 'Cellular renewal support with spermidine, B vitamins, zinc, magnesium, and L-theanine for healthy aging.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Spermidine Extract 5mg', 'Vitamin B1 1.5mg', 'Vitamin B6 1.5mg', 'Zinc 1.4mg', 'Magnesium 5mg', 'L-Theanine 50mg'],
    ingredients: [
      { name: 'Spermidine Extract', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B1', amount: '1.5', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '1.5', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '1.4', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'L-Theanine', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'pqq',
    sku: 'DUR-C080',
    name: 'PQQ (Pyrroloquinoline Quinone)',
    categoryId: 'specialty-formulas',
    description: 'Mitochondrial support with PQQ, CoQ10, vitamin B12, alpha lipoic acid, and resveratrol for cellular energy.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['PQQ 20mg', 'Coenzyme Q10 100mg', 'Vitamin B12 20mcg', 'Alpha-Lipoic Acid 50mg', 'Resveratrol 50mg'],
    ingredients: [
      { name: 'PQQ', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Coenzyme Q10', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B12', amount: '20', unit: 'mcg', dailyValue: '*' },
      { name: 'Alpha-Lipoic Acid', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Resveratrol', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'ergothioneine',
    sku: 'DUR-C081',
    name: 'Ergothioneine',
    categoryId: 'specialty-formulas',
    description: 'Longevity antioxidant ergothioneine with alpha lipoic acid, green tea, grape seed, and turmeric.',
    servingSize: '1 capsule',
    servingsPerContainer: 60,
    keyIngredients: ['Ergothioneine 500mg', 'Alpha Lipoic Acid 100mg', 'Green Tea Extract 100mg', 'Grape Seed Extract 100mg', 'Turmeric Root Extract 50mg'],
    ingredients: [
      { name: 'Ergothioneine', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha Lipoic Acid', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Green Tea Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Grape Seed Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Turmeric Root Extract', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },

  // ----------------------------------------
  // GUMMIES
  // ----------------------------------------
  {
    id: 'creatine-gummies',
    sku: 'DUR-G001',
    name: 'Creatine Gummies',
    categoryId: 'gummies',
    description: 'Convenient creatine monohydrate in delicious gummy form for muscle performance and strength support.',
    servingSize: '4 gummies',
    servingsPerContainer: 15,
    keyIngredients: ['Creatine Monohydrate 5g'],
    ingredients: [
      { name: 'Creatine Monohydrate', amount: '5', unit: 'g', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'mullein-gummies',
    sku: 'DUR-G002',
    name: 'Mullein Gummies',
    categoryId: 'gummies',
    description: 'Traditional respiratory support with mullein extract, ginger root, and licorice root in tasty gummy form.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Mullein Extract', 'Ginger Root', 'Licorice Root'],
    ingredients: [
      { name: 'Mullein Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ginger Root', amount: '', unit: '', dailyValue: '*' },
      { name: 'Licorice Root', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'female-balance-gummies',
    sku: 'DUR-G003',
    name: 'Female Balance Gummies',
    categoryId: 'gummies',
    description: 'Hormonal balance support with myo-inositol, D-chiro inositol, and folate for women\'s wellness.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Myo-Inositol 2000mg', 'D-Chiro Inositol 50mg', 'Folate 400mcg DFE'],
    ingredients: [
      { name: 'Myo-Inositol', amount: '2000', unit: 'mg', dailyValue: '*' },
      { name: 'D-Chiro Inositol', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Folate 400mcg DFE', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'daily-tanning-gummies',
    sku: 'DUR-G004',
    name: 'Daily Tanning Gummies',
    categoryId: 'gummies',
    description: 'Skin support formula with lutein, zeaxanthin, vitamin E, and vitamin C for healthy skin tone.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Lutein 20mg', 'Zeaxanthin', 'Vitamin E', 'Vitamin C'],
    ingredients: [
      { name: 'Lutein', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Zeaxanthin', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin E', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin C', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'mushroom-gummies',
    sku: 'DUR-G005',
    name: 'Mushroom Gummies',
    categoryId: 'gummies',
    description: 'Functional mushroom complex with lion\'s mane, reishi, and cordyceps in convenient gummy form.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Mushroom Complex 500mg', "Lion's Mane", 'Reishi', 'Cordyceps'],
    ingredients: [
      { name: 'Mushroom Complex', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'beetroot-gummies',
    sku: 'DUR-G006',
    name: 'Beetroot Gummies',
    categoryId: 'gummies',
    description: 'Nitrate-rich beet root with pomegranate for cardiovascular and athletic performance support.',
    servingSize: '1 gummy',
    servingsPerContainer: 60,
    keyIngredients: ['Beet Root Powder', 'Pomegranate'],
    ingredients: [
      { name: 'Beet Root Powder', amount: '', unit: '', dailyValue: '*' },
      { name: 'Pomegranate', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'womens-probiotic-gummies',
    sku: 'DUR-G007',
    name: "Women's Probiotic Gummies",
    categoryId: 'gummies',
    description: 'Women-specific probiotic blend with lactobacillus strains and prebiotic fiber for digestive and vaginal health.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Probiotic Blend 5 Billion CFU', 'Lactobacillus', 'Prebiotic Fiber'],
    ingredients: [
      { name: 'Probiotic Blend', amount: '5', unit: 'Billion CFU', dailyValue: '*' },
      { name: 'Lactobacillus', amount: '', unit: '', dailyValue: '*' },
      { name: 'Prebiotic Fiber', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'shilajit-gummies',
    sku: 'DUR-G008',
    name: 'Shilajit Gummies',
    categoryId: 'gummies',
    description: 'Himalayan shilajit extract with fulvic acid in delicious gummy form for energy and vitality.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Shilajit Extract 1000mg', 'Fulvic Acid'],
    ingredients: [
      { name: 'Shilajit Extract', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'Fulvic Acid', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'sea-moss-gummies',
    sku: 'DUR-G009',
    name: 'Sea Moss Gummies',
    categoryId: 'gummies',
    description: 'Irish sea moss with bladderwrack and burdock root for mineral-rich immune and thyroid support.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Irish Sea Moss 1000mg', 'Bladderwrack 500mg', 'Burdock Root 500mg'],
    ingredients: [
      { name: 'Irish Sea Moss', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'Bladderwrack', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Burdock Root', amount: '500', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'sleep-gummies',
    sku: 'DUR-G010',
    name: 'Sleep Gummies',
    categoryId: 'gummies',
    description: 'Relaxing sleep support with melatonin, L-theanine, and magnesium for restful nights.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Melatonin 5mg', 'L-Theanine 200mg', 'Magnesium 100mg'],
    ingredients: [
      { name: 'Melatonin', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'L-Theanine', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'ashwagandha-gummies',
    sku: 'DUR-G011',
    name: 'Ashwagandha Gummies',
    categoryId: 'gummies',
    description: 'Premium KSM-66 ashwagandha root extract for stress relief and adaptogenic support in gummy form.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Ashwagandha Root Extract 600mg', 'KSM-66'],
    ingredients: [
      { name: 'Ashwagandha Root Extract', amount: '600', unit: 'mg', dailyValue: '*' },
      { name: 'KSM-66', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'bromelain-gummies',
    sku: 'DUR-G012',
    name: 'Bromelain Gummies',
    categoryId: 'gummies',
    description: 'Digestive enzyme support with bromelain, papain, and protease for protein digestion and inflammation support.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Bromelain 500mg (2400 GDU/g)', 'Papain 100mg', 'Protease 50mg'],
    ingredients: [
      { name: 'Bromelain', amount: '500', unit: 'mg', dailyValue: '*', source: '(2400 GDU/g)' },
      { name: 'Papain', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Protease', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'anti-aging-gummies',
    sku: 'DUR-G013',
    name: 'Anti-Aging Gummies',
    categoryId: 'gummies',
    description: 'Cellular rejuvenation formula with resveratrol, CoQ10, vitamin C, and vitamin E for healthy aging.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Resveratrol 200mg', 'CoQ10 100mg', 'Vitamin C 90mg', 'Vitamin E 15mg'],
    ingredients: [
      { name: 'Resveratrol', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'CoQ10', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '90', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '15', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'vitamin-c-gummies',
    sku: 'DUR-G014',
    name: 'Vitamin C Gummies',
    categoryId: 'gummies',
    description: 'Essential vitamin C in delicious gummy form for immune support and antioxidant protection.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin C 250mg'],
    ingredients: [
      { name: 'Vitamin C', amount: '250', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'skin-whitening-gummies',
    sku: 'DUR-G015',
    name: 'Skin Brightening Gummies',
    categoryId: 'gummies',
    description: 'Skin brightening formula with L-glutathione, vitamin C, and collagen for radiant complexion.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['L-Glutathione 500mg', 'Vitamin C 100mg', 'Collagen 50mg'],
    ingredients: [
      { name: 'L-Glutathione', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Collagen', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'maca-gummies',
    sku: 'DUR-G016',
    name: 'Maca Gummies',
    categoryId: 'gummies',
    description: 'Peruvian maca root with ginseng and L-arginine for energy, stamina, and hormonal balance.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Maca Root Extract 1000mg', 'Ginseng 200mg', 'L-Arginine 200mg'],
    ingredients: [
      { name: 'Maca Root Extract', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'Ginseng', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'L-Arginine', amount: '200', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'glutathione-gummies',
    sku: 'DUR-G017',
    name: 'L-Glutathione Gummies',
    categoryId: 'gummies',
    description: 'Master antioxidant glutathione with vitamin C and alpha lipoic acid for cellular protection.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['L-Glutathione 500mg', 'Vitamin C 100mg', 'Alpha Lipoic Acid 100mg'],
    ingredients: [
      { name: 'L-Glutathione', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Alpha Lipoic Acid', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'collagen-gummies',
    sku: 'DUR-G018',
    name: 'Collagen Gummies',
    categoryId: 'gummies',
    description: 'Beauty collagen peptides with vitamin C, biotin, and hyaluronic acid for skin, hair, and nails.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Collagen Type I & III 250mg', 'Vitamin C 90mg', 'Hyaluronic Acid 50mg', 'Biotin 5000mcg'],
    ingredients: [
      { name: 'Collagen Type I & III', amount: '250', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '90', unit: 'mg', dailyValue: '*' },
      { name: 'Hyaluronic Acid', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Biotin', amount: '5000', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'hair-gummies',
    sku: 'DUR-G019',
    name: 'Hair Gummies',
    categoryId: 'gummies',
    description: 'Hair growth support with biotin, vitamin C, vitamin E, and folate for healthy, lustrous hair.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Biotin 5000mcg', 'Vitamin C 60mg', 'Vitamin E 15mg', 'Folate 400mcg DFE'],
    ingredients: [
      { name: 'Biotin', amount: '5000', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '60', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '15', unit: 'mg', dailyValue: '*' },
      { name: 'Folate 400mcg DFE', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'body-enhancement-gummies',
    sku: 'DUR-G020',
    name: 'Body Enhancement Gummies',
    categoryId: 'gummies',
    description: 'Natural body contouring support with maca root, fenugreek, and saw palmetto.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Maca Root 1000mg', 'Fenugreek 500mg', 'Saw Palmetto 300mg'],
    ingredients: [
      { name: 'Maca Root', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'Fenugreek', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Saw Palmetto', amount: '300', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'lutein-gummies',
    sku: 'DUR-G021',
    name: 'Lutein Gummies',
    categoryId: 'gummies',
    description: 'Eye health support with lutein, zeaxanthin, and vitamin A for vision protection.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Lutein 20mg', 'Zeaxanthin 4mg', 'Vitamin A 900mcg'],
    ingredients: [
      { name: 'Lutein', amount: '20', unit: 'mg', dailyValue: '*' },
      { name: 'Zeaxanthin', amount: '4', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin A', amount: '900', unit: 'mcg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },

  // ----------------------------------------
  // POWDERS
  // ----------------------------------------
  {
    id: 'dandelion-root-powder',
    sku: 'DUR-P001',
    name: 'Dandelion Root Extract Powder',
    categoryId: 'powders',
    description: 'Traditional dandelion root extract powder for liver support and gentle detoxification.',
    servingSize: '1 scoop (4g)',
    servingsPerContainer: 30,
    keyIngredients: ['Dandelion Root Extract 4000mg'],
    ingredients: [
      { name: 'Dandelion Root Extract', amount: '4000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'moringa-powder',
    sku: 'DUR-P002',
    name: 'Moringa Leaf Powder',
    categoryId: 'powders',
    description: 'Nutrient-dense moringa leaf powder packed with vitamins, minerals, and antioxidants.',
    servingSize: '1 scoop',
    servingsPerContainer: 30,
    keyIngredients: ['Moringa Leaf Powder 2000mg'],
    ingredients: [
      { name: 'Moringa Leaf Powder', amount: '2000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'lions-mane-powder',
    sku: 'DUR-P003',
    name: "Lion's Mane Powder",
    categoryId: 'powders',
    description: "Premium lion's mane mushroom extract powder for cognitive function and brain health.",
    servingSize: '1 scoop (2g)',
    servingsPerContainer: 30,
    keyIngredients: ["Lion's Mane Mushroom Extract 2000mg"],
    ingredients: [
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'mushroom-coffee',
    sku: 'DUR-P004',
    name: 'Mushroom Coffee Powder',
    categoryId: 'powders',
    description: "Functional coffee blend with lion's mane, chaga, and cordyceps for focused energy without jitters.",
    servingSize: '1 tbsp (6g)',
    servingsPerContainer: 30,
    keyIngredients: ['Coffee 4g', "Lion's Mane 500mg", 'Chaga 500mg', 'Cordyceps 500mg'],
    ingredients: [
      { name: 'Coffee', amount: '4', unit: 'g', dailyValue: '*' },
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'mushroom-matcha',
    sku: 'DUR-P005',
    name: 'Mushroom Matcha Powder',
    categoryId: 'powders',
    description: "Ceremonial-grade matcha with lion's mane and reishi for calm, focused energy.",
    servingSize: '1 tsp (3g)',
    servingsPerContainer: 30,
    keyIngredients: ['Matcha 2g', "Lion's Mane 500mg", 'Reishi 500mg'],
    ingredients: [
      { name: 'Matcha', amount: '2', unit: 'g', dailyValue: '*' },
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'creatine-powder',
    sku: 'DUR-P006',
    name: 'Creatine Monohydrate Powder',
    categoryId: 'powders',
    description: 'Pure micronized creatine monohydrate for muscle strength, power, and performance.',
    servingSize: '1 scoop (5g)',
    servingsPerContainer: 60,
    keyIngredients: ['Creatine Monohydrate 5000mg'],
    ingredients: [
      { name: 'Creatine Monohydrate', amount: '5000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'whey-protein-isolate',
    sku: 'DUR-P007',
    name: 'Whey Protein Isolate Powder',
    categoryId: 'powders',
    description: 'High-quality whey protein isolate with BCAAs for muscle building and recovery.',
    servingSize: '1 scoop (30g)',
    servingsPerContainer: 30,
    keyIngredients: ['Whey Protein Isolate 25g', 'BCAAs 5.5g'],
    ingredients: [
      { name: 'Whey Protein Isolate', amount: '25', unit: 'g', dailyValue: '*' },
      { name: 'BCAAs', amount: '5.5', unit: 'g', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'skin-hydrating-powder',
    sku: 'DUR-P008',
    name: 'Skin Hydrating Powder',
    categoryId: 'powders',
    description: 'Beauty blend with collagen peptides, hyaluronic acid, vitamin C, and biotin for glowing skin.',
    servingSize: '1 scoop',
    servingsPerContainer: 30,
    keyIngredients: ['Collagen Peptides', 'Hyaluronic Acid', 'Vitamin C', 'Biotin'],
    ingredients: [
      { name: 'Collagen Peptides', amount: '', unit: '', dailyValue: '*' },
      { name: 'Hyaluronic Acid', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin C', amount: '', unit: '', dailyValue: '*' },
      { name: 'Biotin', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'mood-boost-powder',
    sku: 'DUR-P009',
    name: 'Mood Boost Powder',
    categoryId: 'powders',
    description: 'Stress-relief blend with L-tyrosine, L-theanine, rhodiola, and ashwagandha for mood support.',
    servingSize: '1 packet (7.7g)',
    servingsPerContainer: 30,
    keyIngredients: ['L-Tyrosine 1000mg', 'L-Theanine 200mg', 'Rhodiola Rosea 300mg', 'Ashwagandha 300mg'],
    ingredients: [
      { name: 'L-Tyrosine', amount: '1000', unit: 'mg', dailyValue: '*' },
      { name: 'L-Theanine', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Rhodiola Rosea', amount: '300', unit: 'mg', dailyValue: '*' },
      { name: 'Ashwagandha', amount: '300', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'slim-green-coffee',
    sku: 'DUR-P010',
    name: 'Slim Green Coffee Powder',
    categoryId: 'powders',
    description: 'Weight management support with green coffee bean extract and garcinia cambogia.',
    servingSize: '1 sachet',
    servingsPerContainer: 30,
    keyIngredients: ['Green Coffee Bean Extract 3000mg', 'Garcinia Cambogia 1000mg'],
    ingredients: [
      { name: 'Green Coffee Bean Extract', amount: '3000', unit: 'mg', dailyValue: '*' },
      { name: 'Garcinia Cambogia', amount: '1000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'spirulina-powder',
    sku: 'DUR-P011',
    name: 'Spirulina Powder',
    categoryId: 'powders',
    description: 'Organic spirulina superfood powder rich in protein, vitamins, and antioxidants.',
    servingSize: '1 scoop (3g)',
    servingsPerContainer: 100,
    keyIngredients: ['Organic Spirulina 3000mg'],
    ingredients: [
      { name: 'Organic Spirulina', amount: '3000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'dietary-fiber-powder',
    sku: 'DUR-P012',
    name: 'Dietary Fiber Powder',
    categoryId: 'powders',
    description: 'Pure psyllium husk fiber for digestive regularity and gut health support.',
    servingSize: '1 scoop (5g)',
    servingsPerContainer: 60,
    keyIngredients: ['Psyllium Husk 5000mg'],
    ingredients: [
      { name: 'Psyllium Husk', amount: '5000', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'nad-plus-powder',
    sku: 'DUR-P013',
    name: 'NAD+ Powder',
    categoryId: 'powders',
    description: 'Cellular energy support with nicotinamide riboside, resveratrol, and quercetin for healthy aging.',
    servingSize: '1 scoop',
    servingsPerContainer: 30,
    keyIngredients: ['Nicotinamide Riboside 300mg', 'Resveratrol 200mg', 'Quercetin 100mg'],
    ingredients: [
      { name: 'Nicotinamide Riboside', amount: '300', unit: 'mg', dailyValue: '*' },
      { name: 'Resveratrol', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Quercetin', amount: '100', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },
  {
    id: 'green-blend-powder',
    sku: 'DUR-P014',
    name: 'Green Blend Powder',
    categoryId: 'powders',
    description: 'Superfood greens blend with spirulina, chlorella, wheatgrass, barley grass, and leafy vegetables.',
    servingSize: '1 scoop (8g)',
    servingsPerContainer: 30,
    keyIngredients: ['Spirulina', 'Chlorella', 'Wheatgrass', 'Barley Grass', 'Alfalfa', 'Spinach'],
    ingredients: [
      { name: 'Spirulina', amount: '', unit: '', dailyValue: '*' },
      { name: 'Chlorella', amount: '', unit: '', dailyValue: '*' },
      { name: 'Wheatgrass', amount: '', unit: '', dailyValue: '*' },
      { name: 'Barley Grass', amount: '', unit: '', dailyValue: '*' },
      { name: 'Alfalfa', amount: '', unit: '', dailyValue: '*' },
      { name: 'Spinach', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'powder'
  },

  // ----------------------------------------
  // KIDS HEALTH
  // ----------------------------------------
  {
    id: 'kids-probiotic-gummies',
    sku: 'DUR-G022',
    name: 'Kids Probiotic Gummies',
    categoryId: 'kids-health',
    description: 'Gentle probiotic formula with vitamins C, D3, and zinc designed for children\'s digestive and immune health.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Bacillus coagulans 1 billion CFU', 'Vitamin C 30mg', 'Vitamin D3 10mcg', 'Zinc 2.5mg'],
    ingredients: [
      { name: 'Bacillus coagulans', amount: '1', unit: 'billion CFU', dailyValue: '*' },
      { name: 'Vitamin C', amount: '30', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '10', unit: 'mcg', dailyValue: '*' },
      { name: 'Zinc', amount: '2.5', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'kids-brain-gummies',
    sku: 'DUR-G023',
    name: 'Kids Brain Gummies',
    categoryId: 'kids-health',
    description: 'DHA and EPA omega-3s with B vitamins for children\'s brain development and cognitive function.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['DHA 100mg', 'EPA 50mg', 'Vitamin B6 1mg', 'Folate 200mcg DFE'],
    ingredients: [
      { name: 'DHA', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'EPA', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '1', unit: 'mg', dailyValue: '*' },
      { name: 'Folate 200mcg DFE', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },
  {
    id: 'kids-multivitamin-gummies',
    sku: 'DUR-G024',
    name: 'Kids Multivitamin Gummies',
    categoryId: 'kids-health',
    description: 'Complete daily multivitamin for children with essential vitamins and minerals for growth and development.',
    servingSize: '2 gummies',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin A 900mcg', 'Vitamin C 90mg', 'Vitamin D 20mcg', 'Vitamin E 15mg', 'B Vitamins', 'Zinc 11mg'],
    ingredients: [
      { name: 'Vitamin A', amount: '900', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin C', amount: '90', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin D', amount: '20', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '15', unit: 'mg', dailyValue: '*' },
      { name: 'B Vitamins', amount: '', unit: '', dailyValue: '*' },
      { name: 'Zinc', amount: '11', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'gummies'
  },

  // ----------------------------------------
  // SPECIALTY FORMATS
  // ----------------------------------------
  {
    id: 'shilajit-resin',
    sku: 'DUR-R001',
    name: 'Shilajit Resin',
    categoryId: 'specialty-formats',
    description: 'Pure Himalayan shilajit resin with 60%+ fulvic acid for energy, vitality, and mineral replenishment.',
    servingSize: '300-500mg',
    servingsPerContainer: 30,
    keyIngredients: ['Purified Shilajit Resin 400mg', 'Fulvic Acid 60%+'],
    ingredients: [
      { name: 'Purified Shilajit Resin', amount: '400', unit: 'mg', dailyValue: '*' },
      { name: 'Fulvic Acid 60%+', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'resin'
  },
  {
    id: 'shilajit-honey-sticks',
    sku: 'DUR-H001',
    name: 'Shilajit Honey Sticks',
    categoryId: 'specialty-formats',
    description: 'Convenient shilajit-infused honey sticks with ginseng for on-the-go energy and vitality.',
    servingSize: '1 stick (10g)',
    servingsPerContainer: 10,
    keyIngredients: ['Shilajit', 'Honey', 'Ginseng'],
    ingredients: [
      { name: 'Shilajit', amount: '', unit: '', dailyValue: '*' },
      { name: 'Honey', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ginseng', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'honey stick'
  },
  {
    id: 'female-shilajit-honey-sticks',
    sku: 'DUR-H002',
    name: 'Female Shilajit Honey Sticks',
    categoryId: 'specialty-formats',
    description: 'Women-specific honey sticks with shilajit, royal jelly, and maca root for energy and hormonal balance.',
    servingSize: '1 stick (10g)',
    servingsPerContainer: 10,
    keyIngredients: ['Shilajit', 'Honey', 'Royal Jelly', 'Maca Root'],
    ingredients: [
      { name: 'Shilajit', amount: '', unit: '', dailyValue: '*' },
      { name: 'Honey', amount: '', unit: '', dailyValue: '*' },
      { name: 'Royal Jelly', amount: '', unit: '', dailyValue: '*' },
      { name: 'Maca Root', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'honey stick'
  },

  // ----------------------------------------
  // ADDITIONAL CAPSULE PRODUCTS FROM CATALOGS
  // ----------------------------------------
  {
    id: 'male-support-capsules',
    sku: 'DUR-C082',
    name: 'Male Support Capsules',
    categoryId: 'mens-health',
    description: 'Comprehensive male support formula with L-arginine, maca root, tribulus terrestris, and tongkat ali.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['L-Arginine', 'Maca Root', 'Tribulus Terrestris', 'Tongkat Ali'],
    ingredients: [
      { name: 'L-Arginine', amount: '', unit: '', dailyValue: '*' },
      { name: 'Maca Root', amount: '', unit: '', dailyValue: '*' },
      { name: 'Tribulus Terrestris', amount: '', unit: '', dailyValue: '*' },
      { name: 'Tongkat Ali', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'brain-serve-plus',
    sku: 'DUR-C083',
    name: 'BrainServe Plus Capsules',
    categoryId: 'cognitive-support',
    description: 'Nootropic blend with ginkgo biloba, bacopa monnieri, phosphatidylserine, and L-theanine for mental performance.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Ginkgo Biloba', 'Bacopa Monnieri', 'Phosphatidylserine', 'L-Theanine'],
    ingredients: [
      { name: 'Ginkgo Biloba', amount: '', unit: '', dailyValue: '*' },
      { name: 'Bacopa Monnieri', amount: '', unit: '', dailyValue: '*' },
      { name: 'Phosphatidylserine', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Theanine', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'cogni-heart',
    sku: 'DUR-C084',
    name: 'CogniHeart Capsules',
    categoryId: 'cognitive-support',
    description: 'Dual brain and heart support with lion\'s mane, reishi, and cordyceps mushroom extracts.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ["Lion's Mane Mushroom Extract 500mg", 'Reishi Mushroom', 'Cordyceps'],
    ingredients: [
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'calm-bliss',
    sku: 'DUR-C085',
    name: 'Calm Bliss Capsules',
    categoryId: 'sleep-relaxation',
    description: 'Relaxation and stress relief formula with passion flower, magnesium, L-theanine, and calming botanicals for a tranquil mind.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Passion Flower Extract 100mg', 'Magnesium Glycinate', 'L-Theanine', 'Valerian Root', 'GABA'],
    ingredients: [
      { name: 'Passion Flower Extract', amount: '100', unit: 'mg', dailyValue: '*', source: '(Passiflora incarnata)' },
      { name: 'Magnesium', amount: '100', unit: 'mg', dailyValue: '*', source: '(as Magnesium Glycinate)' },
      { name: 'L-Theanine', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Valerian Root Extract', amount: '75', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '10', unit: 'mg', dailyValue: '*', source: '(as Pyridoxine HCl)' },
      { name: 'GABA', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Chamomile Extract', amount: '50', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'slumber-rest',
    sku: 'DUR-C086',
    name: 'Slumber Rest Capsules',
    categoryId: 'sleep-relaxation',
    description: 'Deep sleep support formula with melatonin, 5-HTP, L-tryptophan, and natural sleep-promoting botanicals.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Melatonin 5mg', '5-HTP 50mg', 'L-Tryptophan 100mg', 'Valerian Root', 'Hops Extract'],
    ingredients: [
      { name: 'Melatonin', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: '5-HTP', amount: '50', unit: 'mg', dailyValue: '*', source: '(from Griffonia simplicifolia)' },
      { name: 'L-Tryptophan', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Valerian Root Extract', amount: '100', unit: 'mg', dailyValue: '*' },
      { name: 'Hops Extract', amount: '50', unit: 'mg', dailyValue: '*', source: '(Humulus lupulus)' },
      { name: 'Chamomile Extract', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Magnesium', amount: '50', unit: 'mg', dailyValue: '*', source: '(as Magnesium Glycinate)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'zzz-plus-sleep',
    sku: 'DUR-C087',
    name: 'ZZZ+ Sleep Support Capsules',
    categoryId: 'sleep-relaxation',
    description: 'Enhanced sleep formula with melatonin, L-theanine, magnesium, and GABA for restorative rest.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Melatonin', 'L-Theanine', 'Magnesium', 'GABA'],
    ingredients: [
      { name: 'Melatonin', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Theanine', amount: '', unit: '', dailyValue: '*' },
      { name: 'Magnesium', amount: '', unit: '', dailyValue: '*' },
      { name: 'GABA', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'vithaslim',
    sku: 'DUR-C088',
    name: 'Vithaslim Capsules',
    categoryId: 'weight-management',
    description: 'Comprehensive weight management support with chitosan, green tea, glucomannan, and metabolism-boosting ingredients.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Chitosan 150mg', 'Green Tea 75mg', 'Glucomannan 65mg', 'L-Carnitine 10mg'],
    ingredients: [
      { name: 'Chitosan', amount: '150', unit: 'mg', dailyValue: '*' },
      { name: 'Green Tea Extract', amount: '75', unit: 'mg', dailyValue: '*' },
      { name: 'Coconut Powder', amount: '45', unit: 'mg', dailyValue: '*' },
      { name: 'Glucomannan', amount: '65', unit: 'mg', dailyValue: '*' },
      { name: 'L-Carnitine', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Caffeine', amount: '30', unit: 'mg', dailyValue: '*' },
      { name: 'Black Pepper Extract', amount: '5', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'supreme-slimming',
    sku: 'DUR-C089',
    name: 'Supreme Slimming Capsules',
    categoryId: 'weight-management',
    description: 'Advanced weight management formula with green tea extract, garcinia cambogia, CLA, and thermogenic compounds for enhanced metabolism.',
    servingSize: '1 capsule',
    servingsPerContainer: 90,
    keyIngredients: ['Proprietary Blend 800mg (Green Tea, Garcinia Cambogia, Glucomannan, Cayenne, CLA)'],
    ingredients: [
      { name: 'Proprietary Blend', amount: '800', unit: 'mg', dailyValue: '*', source: '(Green Tea Extract (Decaffeinated, 50% EGCG), Garcinia Cambogia Extract (50% HCA), Glucomannan, Cayenne Pepper Extract (40,000 SHU), CLA (Conjugated Linoleic Acid), Caffeine Anhydrous)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'hairglow',
    sku: 'DUR-C090',
    name: 'Hairglow Capsules',
    categoryId: 'beauty',
    description: 'Premium hair growth formula with biotin, keratin, collagen, and essential vitamins.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Biotin 5000mcg', 'Keratin', 'Collagen', 'Vitamins'],
    ingredients: [
      { name: 'Biotin', amount: '5000', unit: 'mcg', dailyValue: '*' },
      { name: 'Keratin', amount: '', unit: '', dailyValue: '*' },
      { name: 'Collagen', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamins', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'dhairwell',
    sku: 'DUR-C091',
    name: 'DHairwell Capsules',
    categoryId: 'beauty',
    description: 'Hair health complex with vitamin A, biotin, and zinc for stronger, healthier hair.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin A 1500 IU', 'Biotin 5000mcg', 'Zinc 11mg'],
    ingredients: [
      { name: 'Vitamin A', amount: '1500', unit: 'IU', dailyValue: '*' },
      { name: 'Biotin', amount: '5000', unit: 'mcg', dailyValue: '*' },
      { name: 'Zinc', amount: '11', unit: 'mg', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'immune-pro',
    sku: 'DUR-C092',
    name: 'Immune Pro Capsules',
    categoryId: 'immunity-wellness',
    description: 'Comprehensive immune support with vitamin C, zinc, and echinacea for year-round wellness.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin C 500mg', 'Zinc 11mg', 'Echinacea'],
    ingredients: [
      { name: 'Vitamin C', amount: '500', unit: 'mg', dailyValue: '*' },
      { name: 'Zinc', amount: '11', unit: 'mg', dailyValue: '*' },
      { name: 'Echinacea', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'dm-vitality',
    sku: 'DUR-C093',
    name: 'DMVitality Capsules',
    categoryId: 'immunity-wellness',
    description: 'Daily immune support with vitamin C, vitamin D, zinc, and elderberry for optimal wellness.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Vitamin C', 'Vitamin D', 'Zinc', 'Elderberry'],
    ingredients: [
      { name: 'Vitamin C', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin D', amount: '', unit: '', dailyValue: '*' },
      { name: 'Zinc', amount: '', unit: '', dailyValue: '*' },
      { name: 'Elderberry', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'acne-support',
    sku: 'DUR-C094',
    name: 'Acne Support Capsules',
    categoryId: 'beauty',
    description: 'Skin clarity formula with vitamin A, zinc, selenium, vitamin E, and vitamin C for clearer skin.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin A 10,000 IU', 'Zinc 50mg', 'Selenium 200mcg', 'Vitamin E', 'Vitamin C'],
    ingredients: [
      { name: 'Vitamin A', amount: '10000', unit: 'IU', dailyValue: '*' },
      { name: 'Zinc', amount: '50', unit: 'mg', dailyValue: '*' },
      { name: 'Selenium', amount: '200', unit: 'mcg', dailyValue: '*' },
      { name: 'Vitamin E', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin C', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'glycovine',
    sku: 'DUR-C095',
    name: 'GlycoVine Capsules',
    categoryId: 'specialty-formulas',
    description: 'Blood sugar support formula with berberine, Ceylon cinnamon, and alpha lipoic acid.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Berberine HCl', 'Ceylon Cinnamon', 'Alpha Lipoic Acid'],
    ingredients: [
      { name: 'Berberine HCl', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ceylon Cinnamon', amount: '', unit: '', dailyValue: '*' },
      { name: 'Alpha Lipoic Acid', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'natural-womens-support',
    sku: 'DUR-C096',
    name: 'Natural Women\'s Support Capsules',
    categoryId: 'womens-health',
    description: 'Women\'s wellness blend with 6-organ proprietary formula for hormonal and reproductive health.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['6 Organ Proprietary Blend 600mg'],
    ingredients: [
      { name: '6 Organ Proprietary Blend', amount: '600', unit: 'mg', dailyValue: '*', source: '(Contact for full ingredient list)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'womens-essentials',
    sku: 'DUR-C097',
    name: 'Women\'s Essentials Capsules',
    categoryId: 'womens-health',
    description: 'Daily essentials for women\'s health with targeted vitamins and botanical extracts.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Proprietary Women\'s Blend'],
    ingredients: [
      { name: 'Proprietary Women\'s Blend', amount: '', unit: '', dailyValue: '*', source: '(Contact for full ingredient list)' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'cellular-shield',
    sku: 'DUR-C098',
    name: 'Cellular Shield Capsules',
    categoryId: 'specialty-formulas',
    description: 'Cellular protection formula with DIM and calcium D-glucarate for hormone metabolism support.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['DIM 200mg', 'Calcium D-Glucarate'],
    ingredients: [
      { name: 'DIM', amount: '200', unit: 'mg', dailyValue: '*' },
      { name: 'Calcium D-Glucarate', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'pure-vibe',
    sku: 'DUR-C099',
    name: 'PureVibe Capsules',
    categoryId: 'womens-health',
    description: 'Women\'s vitality blend with maca root, ashwagandha, and black cohosh for energy and balance.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Maca Root', 'Ashwagandha', 'Black Cohosh'],
    ingredients: [
      { name: 'Maca Root', amount: '', unit: '', dailyValue: '*' },
      { name: 'Ashwagandha', amount: '', unit: '', dailyValue: '*' },
      { name: 'Black Cohosh', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'brain-energy',
    sku: 'DUR-C100',
    name: 'Brain Energy Capsules',
    categoryId: 'cognitive-support',
    description: 'Nootropic energy formula with alpha GPC, lion\'s mane, bacopa monnieri, and rhodiola rosea.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Alpha GPC', "Lion's Mane", 'Bacopa Monnieri', 'Rhodiola Rosea'],
    ingredients: [
      { name: 'Alpha GPC', amount: '', unit: '', dailyValue: '*' },
      { name: 'Lion', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' },
      { name: ',', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'memory-focus',
    sku: 'DUR-C101',
    name: 'Memory Focus Capsules',
    categoryId: 'cognitive-support',
    description: 'Memory enhancement formula with ginkgo biloba, phosphatidylserine, DMAE, and L-glutamine.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Ginkgo Biloba', 'Phosphatidylserine', 'DMAE', 'L-Glutamine'],
    ingredients: [
      { name: 'Ginkgo Biloba', amount: '', unit: '', dailyValue: '*' },
      { name: 'Phosphatidylserine', amount: '', unit: '', dailyValue: '*' },
      { name: 'DMAE', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Glutamine', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'heart-vascular',
    sku: 'DUR-C102',
    name: 'Heart & Vascular Capsules',
    categoryId: 'heart-health',
    description: 'Cardiovascular support with CoQ10, omega-3, and hawthorn berry for heart health.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['CoQ10', 'Omega-3', 'Hawthorn Berry'],
    ingredients: [
      { name: 'CoQ10', amount: '', unit: '', dailyValue: '*' },
      { name: 'Omega-3', amount: '', unit: '', dailyValue: '*' },
      { name: 'Hawthorn Berry', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'calm-plus',
    sku: 'DUR-C103',
    name: 'Calm Plus Capsules',
    categoryId: 'sleep-relaxation',
    description: 'Relaxation formula with magnesium, L-theanine, GABA, and valerian root for stress relief.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Magnesium', 'L-Theanine', 'GABA', 'Valerian Root'],
    ingredients: [
      { name: 'Magnesium', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Theanine', amount: '', unit: '', dailyValue: '*' },
      { name: 'GABA', amount: '', unit: '', dailyValue: '*' },
      { name: 'Valerian Root', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'valmetol',
    sku: 'DUR-C104',
    name: 'Valmetol Capsules',
    categoryId: 'sleep-relaxation',
    description: 'Sleep support with valerian root, melatonin, and chamomile for restful nights.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Valerian Root', 'Melatonin', 'Chamomile'],
    ingredients: [
      { name: 'Valerian Root', amount: '', unit: '', dailyValue: '*' },
      { name: 'Melatonin', amount: '', unit: '', dailyValue: '*' },
      { name: 'Chamomile', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'apple-beet-slimming',
    sku: 'DUR-C105',
    name: 'Apple & Beet Slimming Capsules',
    categoryId: 'weight-management',
    description: 'Natural slimming support with apple cider vinegar, beet root, pomegranate, and B vitamins.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Apple Cider Vinegar', 'Beet Root', 'Pomegranate', 'Vitamin B6', 'Vitamin B12'],
    ingredients: [
      { name: 'Apple Cider Vinegar', amount: '', unit: '', dailyValue: '*' },
      { name: 'Beet Root', amount: '', unit: '', dailyValue: '*' },
      { name: 'Pomegranate', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin B12', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'envitalite',
    sku: 'DUR-C106',
    name: 'Envitalite Capsules',
    categoryId: 'immunity-wellness',
    description: 'High-potency immune formula with 50 billion CFU probiotics, vitamin C, zinc, echinacea, and elderberry.',
    servingSize: '2 capsules',
    servingsPerContainer: 60,
    keyIngredients: ['Probiotics 50 Billion CFU', 'Vitamin C', 'Zinc', 'Echinacea', 'Elderberry'],
    ingredients: [
      { name: 'Probiotics', amount: '50', unit: 'Billion CFU', dailyValue: '*' },
      { name: 'Vitamin C', amount: '', unit: '', dailyValue: '*' },
      { name: 'Zinc', amount: '', unit: '', dailyValue: '*' },
      { name: 'Echinacea', amount: '', unit: '', dailyValue: '*' },
      { name: 'Elderberry', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'irish-moss-capsules',
    sku: 'DUR-C107',
    name: 'Irish Moss Capsules',
    categoryId: 'immunity-wellness',
    description: 'Traditional sea moss blend with bladderwrack and burdock root for mineral-rich immune support.',
    servingSize: '2 capsules',
    servingsPerContainer: 45,
    keyIngredients: ['Irish Sea Moss', 'Bladderwrack', 'Burdock Root'],
    ingredients: [
      { name: 'Irish Sea Moss', amount: '', unit: '', dailyValue: '*' },
      { name: 'Bladderwrack', amount: '', unit: '', dailyValue: '*' },
      { name: 'Burdock Root', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'testosterone-boost',
    sku: 'DUR-C108',
    name: 'Testosterone Boost Capsules',
    categoryId: 'mens-health',
    description: 'Natural testosterone support with fenugreek extract, vitamin D3, zinc, and magnesium.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Fenugreek Extract', 'Vitamin D3', 'Zinc', 'Magnesium'],
    ingredients: [
      { name: 'Fenugreek Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'Vitamin D3', amount: '', unit: '', dailyValue: '*' },
      { name: 'Zinc', amount: '', unit: '', dailyValue: '*' },
      { name: 'Magnesium', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  },
  {
    id: 'your-boost',
    sku: 'DUR-C109',
    name: 'Your Boost Capsules',
    categoryId: 'mens-health',
    description: 'Male performance support with B vitamins, horny goat weed extract, and L-arginine HCl.',
    servingSize: '2 capsules',
    servingsPerContainer: 30,
    keyIngredients: ['Vitamin B3 10mg', 'Vitamin B6 5mg', 'Horny Goat Weed Extract', 'L-Arginine HCl'],
    ingredients: [
      { name: 'Vitamin B3', amount: '10', unit: 'mg', dailyValue: '*' },
      { name: 'Vitamin B6', amount: '5', unit: 'mg', dailyValue: '*' },
      { name: 'Horny Goat Weed Extract', amount: '', unit: '', dailyValue: '*' },
      { name: 'L-Arginine HCl', amount: '', unit: '', dailyValue: '*' }
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
    dosageForm: 'capsules'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a category by its ID
 */
export function getCategoryById(id) {
  return productCategories.find(cat => cat.id === id);
}

/**
 * Get a category by its slug
 */
export function getCategoryBySlug(slug) {
  return productCategories.find(cat => cat.slug === slug);
}

/**
 * Get all category slugs
 */
export function getAllCategorySlugs() {
  return productCategories.map(cat => cat.slug);
}

/**
 * Get a product by its ID
 */
export function getProductById(id) {
  return products.find(product => product.id === id);
}

/**
 * Get all products in a category
 */
export function getProductsByCategory(categoryId) {
  return products.filter(product => product.categoryId === categoryId);
}

/**
 * Get product count by category
 */
export function getProductCountByCategory() {
  return productCategories.map(cat => ({
    ...cat,
    count: products.filter(p => p.categoryId === cat.id).length
  }));
}

/**
 * Get total product count
 */
export function getTotalProductCount() {
  return products.length;
}

/**
 * Search products by name or description
 */
export function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery)
  );
}
