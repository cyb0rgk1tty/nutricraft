export const formulations = [
  {
    id: 'tablets',
    name: 'Tablets',
    slug: 'tablets',
    tagline: 'Cost-effective, long shelf life, high potency',
    shortDescription: 'The most economical choice with excellent stability and precise dosing.',
    metaDescription: 'Discover why tablets are the powerhouse format for maximum potency supplements. Learn about advanced tablet technologies, cost efficiency, and optimal applications for your supplement needs.',
    image: '/images/formulations/whitetabs-800.jpg',
    responsiveImages: {
      small: '/images/formulations/whitetabs-400.jpg',
      medium: '/images/formulations/whitetabs-800.jpg',
      large: '/images/formulations/whitetabs-1200.jpg',
      smallWebp: '/images/formulations/whitetabs-400.webp',
      mediumWebp: '/images/formulations/whitetabs-800.webp',
      largeWebp: '/images/formulations/whitetabs-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/tablets-400.jpg',
      medium: '/images/formulations/articles/tablets-800.jpg',
      large: '/images/formulations/articles/tablets-1200.jpg',
      smallWebp: '/images/formulations/articles/tablets-400.webp',
      mediumWebp: '/images/formulations/articles/tablets-800.webp',
      largeWebp: '/images/formulations/articles/tablets-1200.webp',
      alt: 'Professional tablet supplement manufacturing'
    },
    imageAlt: 'White supplement tablets',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
    </svg>`,
    bestFor: ['Vitamins', 'Minerals', 'Herbal extracts', 'Antioxidants'],
    benefits: [
      'Longest shelf life of all formats',
      'Most cost-effective to manufacture',
      'Can contain highest concentration of active ingredients',
      'Easy to score for dose splitting',
      'Can be made as extended-release formulations',
      'Stable in various storage conditions'
    ],
    considerations: [
      'May be difficult to swallow for some',
      'Slower initial dissolution than liquids',
      'Requires binding agents',
      'Not suitable for oil-based ingredients'
    ],
    manufacturingDetails: {
      process: 'Direct compression or wet granulation',
      moq: '500 bottles (30,000-60,000 tablets)',
      leadTime: '8-10 weeks for first production',
      shelfLife: '2-3 years typically'
    },
    technicalSpecs: {
      bioavailability: '10-90% depending on formulation',
      dissolutionTime: '30-45 minutes',
      sizes: '5mm to 22mm diameter',
      coatingOptions: ['Film coating', 'Sugar coating', 'Enteric coating']
    },
    targetDemographics: [
      'Cost-conscious consumers',
      'Those seeking precise dosing',
      'Bulk supplement users',
      'B2B and institutional buyers'
    ]
  },
  {
    id: 'capsules',
    name: 'Capsules',
    slug: 'capsules',
    tagline: 'Fast-dissolving, no taste, easy to swallow',
    shortDescription: 'Versatile delivery system ideal for powder-based formulations with rapid absorption.',
    metaDescription: 'Learn why capsules are the ideal delivery system for powder-based supplements. Explore vegetarian options, rapid dissolution benefits, and optimal applications for your supplement needs.',
    image: '/images/formulations/whitecaps-800.jpg',
    responsiveImages: {
      small: '/images/formulations/whitecaps-400.jpg',
      medium: '/images/formulations/whitecaps-800.jpg',
      large: '/images/formulations/whitecaps-1200.jpg',
      smallWebp: '/images/formulations/whitecaps-400.webp',
      mediumWebp: '/images/formulations/whitecaps-800.webp',
      largeWebp: '/images/formulations/whitecaps-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/capsules-400.jpg',
      medium: '/images/formulations/articles/capsules-800.jpg',
      large: '/images/formulations/articles/capsules-1200.jpg',
      smallWebp: '/images/formulations/articles/capsules-400.webp',
      mediumWebp: '/images/formulations/articles/capsules-800.webp',
      largeWebp: '/images/formulations/articles/capsules-1200.webp',
      alt: 'Professional capsule supplement manufacturing'
    },
    imageAlt: 'White supplement capsules',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>`,
    bestFor: ['Probiotics', 'Enzymes', 'Powdered herbs', 'Amino acids'],
    benefits: [
      'Masks unpleasant tastes and odors',
      'Fast dissolution and absorption',
      'Can be opened to mix powder with food/drinks',
      'No binding agents required',
      'Available in vegetarian options',
      'Excellent for sensitive ingredients'
    ],
    considerations: [
      'Limited to powder or liquid fills',
      'May have shorter shelf life than tablets',
      'Sensitive to humidity',
      'Higher cost than tablets'
    ],
    manufacturingDetails: {
      process: 'Encapsulation of powder or liquid fills',
      moq: '500 bottles (30,000-60,000 capsules)',
      leadTime: '8-10 weeks for first production',
      shelfLife: '2 years typically'
    },
    technicalSpecs: {
      bioavailability: 'Generally higher than tablets',
      dissolutionTime: '10-20 minutes',
      sizes: 'Size 000 to Size 5',
      types: ['Gelatin', 'Vegetarian (HPMC)', 'Pullulan', 'Delayed-release']
    },
    targetDemographics: [
      'Health-conscious consumers',
      'Vegetarians/vegans (plant-based capsules)',
      'Those who dislike tablet texture',
      'Premium supplement buyers'
    ]
  },
  {
    id: 'powders',
    name: 'Powders',
    slug: 'powders',
    tagline: 'Flexible dosing, fast absorption, mixable',
    shortDescription: 'Versatile format offering customizable dosing and rapid nutrient delivery.',
    metaDescription: 'Discover the advantages of powder supplements for flexible dosing and rapid absorption. Learn about protein powders, pre-workouts, and why powders offer unmatched versatility for custom formulations.',
    image: '/images/formulations/powder-800.jpg',
    responsiveImages: {
      small: '/images/formulations/powder-400.jpg',
      medium: '/images/formulations/powder-800.jpg',
      large: '/images/formulations/powder-1200.jpg',
      smallWebp: '/images/formulations/powder-400.webp',
      mediumWebp: '/images/formulations/powder-800.webp',
      largeWebp: '/images/formulations/powder-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/powders-400.jpg',
      medium: '/images/formulations/articles/powders-800.jpg',
      large: '/images/formulations/articles/powders-1200.jpg',
      smallWebp: '/images/formulations/articles/powders-400.webp',
      mediumWebp: '/images/formulations/articles/powders-800.webp',
      largeWebp: '/images/formulations/articles/powders-1200.webp',
      alt: 'Professional powder supplement manufacturing'
    },
    imageAlt: 'Supplement powder with scoop',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
    </svg>`,
    bestFor: ['Protein', 'Collagen', 'Pre-workouts', 'Creatine', 'Greens blends'],
    benefits: [
      'Highly customizable dosing',
      'Fast absorption (no breakdown needed)',
      'Can deliver large doses easily',
      'Mixable with beverages or food',
      'No swallowing difficulties',
      'Cost-effective for bulk nutrients'
    ],
    considerations: [
      'Requires measuring/mixing',
      'Taste can be challenging',
      'Less convenient for travel',
      'May have texture issues',
      'Hygroscopic ingredients need protection'
    ],
    manufacturingDetails: {
      process: 'Blending, granulation, or spray drying',
      moq: '500 units (tubs or stick packs)',
      leadTime: '8-10 weeks for first production',
      shelfLife: '2 years in proper packaging'
    },
    technicalSpecs: {
      bioavailability: 'Excellent - no dissolution required',
      absorptionTime: '15-30 minutes',
      packaging: ['Tubs/jars', 'Stick packs', 'Sachets', 'Bulk bags'],
      servingSizes: '1g to 50g+ depending on product'
    },
    targetDemographics: [
      'Athletes and fitness enthusiasts',
      'Those requiring high doses',
      'Smoothie and shake consumers',
      'Value-conscious buyers'
    ]
  },
  {
    id: 'gummies',
    name: 'Gummies',
    slug: 'gummies',
    tagline: 'Great taste, no water required, great for all ages',
    shortDescription: 'Enjoyable supplement format that combines nutrition with a pleasant taste experience.',
    metaDescription: 'Explore gummy vitamins for superior compliance and enjoyable supplementation. Learn about sugar-free options, manufacturing considerations, and why gummies are perfect for all ages.',
    image: '/images/formulations/gummies-800.jpg',
    responsiveImages: {
      small: '/images/formulations/gummies-400.jpg',
      medium: '/images/formulations/gummies-800.jpg',
      large: '/images/formulations/gummies-1200.jpg',
      smallWebp: '/images/formulations/gummies-400.webp',
      mediumWebp: '/images/formulations/gummies-800.webp',
      largeWebp: '/images/formulations/gummies-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/gummies-400.jpg',
      medium: '/images/formulations/articles/gummies-800.jpg',
      large: '/images/formulations/articles/gummies-1200.jpg',
      smallWebp: '/images/formulations/articles/gummies-400.webp',
      mediumWebp: '/images/formulations/articles/gummies-800.webp',
      largeWebp: '/images/formulations/articles/gummies-1200.webp',
      alt: 'Professional gummy supplement manufacturing'
    },
    imageAlt: 'Colorful gummy vitamin supplements',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
    </svg>`,
    bestFor: ['Multivitamins', 'Immune support', 'Beauty supplements', 'Children\'s vitamins'],
    benefits: [
      'Excellent compliance due to taste',
      'No water needed for consumption',
      'Appeals to all age groups',
      'Can deliver functional ingredients',
      'Available in sugar-free options',
      'Fun shapes and flavors possible'
    ],
    considerations: [
      'Lower nutrient density than pills',
      'May contain added sugars',
      'Higher cost per nutrient dose',
      'Stability challenges with some vitamins',
      'Require careful formulation'
    ],
    manufacturingDetails: {
      process: 'Depositing or stamping process',
      moq: '1,000 bottles (60,000-120,000 gummies)',
      leadTime: '10-12 weeks for first production',
      shelfLife: '18-24 months typically'
    },
    technicalSpecs: {
      bioavailability: 'Good, comparable to other solid forms',
      consumptionTime: 'Immediate (chewable)',
      serving: '2-4 gummies typically',
      bases: ['Gelatin', 'Pectin (vegan)', 'Starch-based']
    },
    targetDemographics: [
      'Children and teens',
      'Adults who dislike pills',
      'Elderly consumers',
      'Lifestyle-focused consumers'
    ]
  },
  {
    id: 'chewables',
    name: 'Chewables',
    slug: 'chewables',
    tagline: 'Higher potency than gummies, better taste than tablets',
    shortDescription: 'The perfect balance between therapeutic effectiveness and consumer compliance.',
    metaDescription: 'Explore chewable tablets that combine high-dose capacity with pleasant taste. Learn about enhanced bioavailability, superior stability, and why chewables bridge the gap between potency and palatability.',
    image: '/images/formulations/chewables-800.jpg',
    responsiveImages: {
      small: '/images/formulations/chewables-400.jpg',
      medium: '/images/formulations/chewables-800.jpg',
      large: '/images/formulations/chewables-1200.jpg',
      smallWebp: '/images/formulations/chewables-400.webp',
      mediumWebp: '/images/formulations/chewables-800.webp',
      largeWebp: '/images/formulations/chewables-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/chewables-400.jpg',
      medium: '/images/formulations/articles/chewables-800.jpg',
      large: '/images/formulations/articles/chewables-1200.jpg',
      smallWebp: '/images/formulations/articles/chewables-400.webp',
      mediumWebp: '/images/formulations/articles/chewables-800.webp',
      largeWebp: '/images/formulations/articles/chewables-1200.webp',
      alt: 'Professional chewable supplement manufacturing'
    },
    imageAlt: 'Chewable supplement tablets',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>`,
    bestFor: ['Calcium', 'Vitamin D', 'Multivitamins', 'Antacids'],
    benefits: [
      'Higher active ingredient content than gummies',
      'Enhanced bioavailability through chewing',
      'No water needed for consumption',
      'Better stability than gummies',
      'Pleasant taste without excess sugar',
      'Suitable for all ages'
    ],
    considerations: [
      'Texture preferences vary',
      'Requires flavoring systems',
      'May contain sugar alcohols',
      'Higher cost than regular tablets'
    ],
    manufacturingDetails: {
      process: 'Direct compression with flavor systems',
      moq: '500 bottles (30,000-60,000 tablets)',
      leadTime: '8-10 weeks for first production',
      shelfLife: '2 years typically'
    },
    technicalSpecs: {
      bioavailability: '15-25% better than swallowed tablets',
      consumptionTime: 'Immediate (chewable)',
      activeContent: '40-60% by weight',
      flavorOptions: ['Natural fruit', 'Mint', 'Chocolate', 'Custom flavors']
    },
    targetDemographics: [
      'Children and families',
      'Adults who dislike swallowing pills',
      'Active lifestyle consumers',
      'Those seeking better compliance'
    ]
  },
  {
    id: 'odt',
    name: 'Orally Disintegrating Tablets (ODT)',
    slug: 'odt',
    tagline: 'Fast-dissolving, no water needed, convenient',
    shortDescription: 'Innovative tablets that dissolve rapidly in the mouth for fast absorption and ultimate convenience.',
    metaDescription: 'Discover Orally Disintegrating Tablets (ODTs) - the fast-acting supplement format that dissolves in seconds without water. Learn about rapid absorption, enhanced compliance, and why ODTs are perfect for on-the-go nutrition.',
    image: '/images/formulations/odt-800.jpg',
    responsiveImages: {
      small: '/images/formulations/odt-400.jpg',
      medium: '/images/formulations/odt-800.jpg',
      large: '/images/formulations/odt-1200.jpg',
      smallWebp: '/images/formulations/odt-400.webp',
      mediumWebp: '/images/formulations/odt-800.webp',
      largeWebp: '/images/formulations/odt-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/odt-400.jpg',
      medium: '/images/formulations/articles/odt-800.jpg',
      large: '/images/formulations/articles/odt-1200.jpg',
      smallWebp: '/images/formulations/articles/odt-400.webp',
      mediumWebp: '/images/formulations/articles/odt-800.webp',
      largeWebp: '/images/formulations/articles/odt-1200.webp',
      alt: 'Professional ODT supplement manufacturing'
    },
    imageAlt: 'Orally disintegrating tablet on tongue',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>`,
    bestFor: ['Immune Support', 'Energy Boost', 'Pediatric Vitamins', 'Senior Nutrition'],
    benefits: [
      'Dissolves in 30 seconds to 2 minutes',
      'No water required for administration',
      'Rapid onset of action (20-30% faster)',
      'Enhanced compliance for all ages',
      'Pre-gastric absorption possible',
      'Convenient for travel and on-the-go'
    ],
    considerations: [
      'Requires moisture-resistant packaging',
      'Limited to certain ingredients',
      'May have slight taste/texture',
      'Higher cost than regular tablets',
      'Sensitive to humidity'
    ],
    manufacturingDetails: {
      process: 'Low-force compression or freeze-drying',
      moq: '1,000 bottles (60,000-120,000 tablets)',
      leadTime: '10-12 weeks for first production',
      shelfLife: '18-24 months in proper packaging'
    },
    technicalSpecs: {
      bioavailability: 'Enhanced by 20-30% vs regular tablets',
      dissolutionTime: '30 seconds to 2 minutes',
      sizes: '8mm to 15mm diameter',
      packaging: ['Blister packs', 'Moisture-proof bottles', 'Single-serve sachets']
    },
    targetDemographics: [
      'Pediatric patients',
      'Geriatric consumers',
      'Busy professionals',
      'Those with swallowing difficulties'
    ]
  },
  {
    id: 'softgels',
    name: 'Softgels',
    slug: 'softgels',
    tagline: 'Superior absorption for oil-based nutrients',
    shortDescription: 'Premium delivery system for fat-soluble vitamins and oils with enhanced bioavailability.',
    metaDescription: 'Discover how softgel technology delivers superior absorption for oil-based supplements. Learn about enhanced bioavailability, premium applications, and why softgels are ideal for omega-3s and fat-soluble vitamins.',
    image: '/images/formulations/softgels-800.jpg',
    responsiveImages: {
      small: '/images/formulations/softgels-400.jpg',
      medium: '/images/formulations/softgels-800.jpg',
      large: '/images/formulations/softgels-1200.jpg',
      smallWebp: '/images/formulations/softgels-400.webp',
      mediumWebp: '/images/formulations/softgels-800.webp',
      largeWebp: '/images/formulations/softgels-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/softgels-400.jpg',
      medium: '/images/formulations/articles/softgels-800.jpg',
      large: '/images/formulations/articles/softgels-1200.jpg',
      smallWebp: '/images/formulations/articles/softgels-400.webp',
      mediumWebp: '/images/formulations/articles/softgels-800.webp',
      largeWebp: '/images/formulations/articles/softgels-1200.webp',
      alt: 'Professional softgel supplement manufacturing'
    },
    imageAlt: 'Golden softgel supplements',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
    </svg>`,
    bestFor: ['Fish oils', 'Vitamins'],
    benefits: [
      'Excellent for oil-based ingredients',
      'Enhanced bioavailability for fat-soluble nutrients',
      'Easy to swallow regardless of size',
      'Hermetically sealed for freshness',
      'Protects against oxidation and UV light',
      'Professional appearance'
    ],
    considerations: [
      'Higher manufacturing cost',
      'Temperature sensitive',
      'Not suitable for vegetarians (unless using plant-based shell)',
      'Limited to liquid or oil-soluble ingredients'
    ],
    manufacturingDetails: {
      process: 'Rotary die encapsulation',
      moq: '1,000 bottles (60,000-120,000 softgels)',
      leadTime: '10-12 weeks for first production',
      shelfLife: '2-3 years when properly stored'
    },
    technicalSpecs: {
      bioavailability: 'Up to 4x better than powders for oil-based nutrients',
      dissolutionTime: '20-30 minutes',
      sizes: '3 to 20 minims',
      shapes: ['Oval', 'Oblong', 'Round', 'Custom shapes available']
    },
    targetDemographics: [
      'Premium supplement users',
      'Older adults (easy to swallow)',
      'Those seeking maximum absorption',
      'Omega-3 and fat-soluble vitamin users'
    ]
  },
  {
    id: 'effervescent',
    name: 'Effervescent',
    slug: 'effervescent',
    tagline: '100% bioavailability, instant dissolution, refreshing',
    shortDescription: 'The most scientifically advanced delivery system achieving near-perfect absorption rates.',
    metaDescription: 'Discover how effervescent technology delivers 100% bioavailability for supplements. Learn about instant dissolution, superior absorption, and why effervescent tablets are the premium choice for maximum effectiveness.',
    image: '/images/formulations/effervescent-800.jpg',
    responsiveImages: {
      small: '/images/formulations/effervescent-400.jpg',
      medium: '/images/formulations/effervescent-800.jpg',
      large: '/images/formulations/effervescent-1200.jpg',
      smallWebp: '/images/formulations/effervescent-400.webp',
      mediumWebp: '/images/formulations/effervescent-800.webp',
      largeWebp: '/images/formulations/effervescent-1200.webp'
    },
    articleImage: {
      small: '/images/formulations/articles/effervescent-400.jpg',
      medium: '/images/formulations/articles/effervescent-800.jpg',
      large: '/images/formulations/articles/effervescent-1200.jpg',
      smallWebp: '/images/formulations/articles/effervescent-400.webp',
      mediumWebp: '/images/formulations/articles/effervescent-800.webp',
      largeWebp: '/images/formulations/articles/effervescent-1200.webp',
      alt: 'Professional effervescent supplement manufacturing'
    },
    imageAlt: 'Effervescent tablet dissolving in water',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
    </svg>`,
    bestFor: ['Vitamin C', 'B-Complex', 'Minerals', 'Electrolytes'],
    benefits: [
      'Near 100% bioavailability',
      'Begins absorption immediately',
      'Pleasant taste and experience',
      'No pills to swallow',
      'Precise dosing in liquid form',
      'Refreshing and hydrating'
    ],
    considerations: [
      'Higher manufacturing cost',
      'Requires individual packaging',
      'Limited flavor masking options',
      'May contain sodium bicarbonate',
      'Moisture sensitive packaging needs'
    ],
    manufacturingDetails: {
      process: 'Effervescent granulation and compression',
      moq: '5,000 tubes (100,000-150,000 tablets)',
      leadTime: '12-14 weeks for first production',
      shelfLife: '2 years in moisture-proof packaging'
    },
    technicalSpecs: {
      bioavailability: '90-100% absorption',
      dissolutionTime: '60-120 seconds',
      sizes: '20mm to 35mm diameter',
      packaging: ['Tubes', 'Stick packs', 'Individual wraps']
    },
    targetDemographics: [
      'Performance-focused consumers',
      'Those seeking maximum absorption',
      'International travelers',
      'Premium supplement users'
    ]
  },
  {
    id: 'liquids',
    name: 'Liquids',
    slug: 'liquids',
    tagline: 'Fastest absorption, easy dosing',
    shortDescription: 'Premium liquid formulations offering maximum bioavailability and convenience.',
    metaDescription: 'Learn why liquid supplements offer the fastest absorption rates and highest bioavailability. Explore liquid formulation advantages, applications, and ideal use cases for maximum effectiveness.',
    image: '/images/formulations/liquid-800.jpg',
    responsiveImages: {
      small: '/images/formulations/liquid-400.jpg',
      medium: '/images/formulations/liquid-800.jpg',
      large: '/images/formulations/liquid-1200.jpg',
      smallWebp: '/images/formulations/liquid-400.webp',
      mediumWebp: '/images/formulations/liquid-800.webp',
      largeWebp: '/images/formulations/liquid-1200.webp'
    },
    imageAlt: 'Liquid supplement bottles',
    icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
    </svg>`,
    bestFor: ['Multivitamins', 'Minerals', 'Herbal tinctures'],
    benefits: [
      'Fastest absorption rate of all formats',
      'No dissolution time needed',
      'Easy to adjust dosing',
      'Ideal for those who cannot swallow pills',
      'Can combine multiple ingredients easily',
      'Often better taste than pills'
    ],
    considerations: [
      'Shorter shelf life',
      'Requires preservatives',
      'Glass bottles add shipping weight/cost',
      'May require refrigeration',
      'Potential for contamination once opened'
    ],
    manufacturingDetails: {
      process: 'Solution preparation and bottling',
      moq: '500 bottles',
      leadTime: '8-10 weeks for first production',
      shelfLife: '12-18 months typically'
    },
    technicalSpecs: {
      bioavailability: 'Up to 98% absorption rate',
      absorptionTime: '1-4 minutes',
      packaging: ['Glass bottles', 'PET bottles', 'Dropper bottles', 'Spray bottles'],
      preservatives: ['Natural options available', 'Citric acid', 'Potassium sorbate']
    },
    targetDemographics: [
      'Parents with children',
      'Elderly consumers',
      'Those seeking rapid effects',
      'Premium/natural product buyers'
    ]
  }
];

export const getFormulationBySlug = (slug) => {
  return formulations.find(f => f.slug === slug);
};

export const formulationComparison = {
  absorptionRates: {
    title: 'Absorption Rate Comparison',
    description: 'How quickly different formats are absorbed by the body',
    data: [
      { format: 'Effervescent', rate: '90-100%', time: '60-120 seconds' },
      { format: 'Liquids', rate: '98%', time: '1-4 minutes' },
      { format: 'Powders', rate: '96%', time: '15-30 minutes' },
      { format: 'Softgels', rate: '94%', time: '20-30 minutes' },
      { format: 'Chewables', rate: '85%', time: '15-25 minutes' },
      { format: 'Capsules', rate: '84%', time: '10-20 minutes' },
      { format: 'Gummies', rate: '80%', time: '20-30 minutes' },
      { format: 'Tablets', rate: '10-90%', time: '30-45 minutes' }
    ]
  },
  costComparison: {
    title: 'Relative Cost Analysis',
    description: 'Manufacturing cost comparison (lowest to highest)',
    data: [
      { format: 'Tablets', relativeCost: '$', note: 'Most economical' },
      { format: 'Capsules', relativeCost: '$$', note: 'Moderate cost' },
      { format: 'Powders', relativeCost: '$$', note: 'Varies by packaging' },
      { format: 'Chewables', relativeCost: '$$', note: 'Similar to capsules' },
      { format: 'Gummies', relativeCost: '$$$', note: 'Higher due to flavoring' },
      { format: 'Softgels', relativeCost: '$$$', note: 'Premium format' },
      { format: 'Liquids', relativeCost: '$$$$', note: 'Highest due to packaging' },
      { format: 'Effervescent', relativeCost: '$$$$', note: 'Premium + special packaging' }
    ]
  }
};