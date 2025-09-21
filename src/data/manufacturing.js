export const productFormats = [
  {
    id: 'capsules',
    name: 'Capsules',
    description: 'Vegetarian and gelatin options',
    icon: '💊',
    features: ['Vegetarian options', 'Gelatin options', 'Various sizes', 'Custom colors']
  },
  {
    id: 'tablets',
    name: 'Tablets',
    description: 'Standard and chewable varieties',
    icon: '💉',
    features: ['Compressed tablets', 'Chewable options', 'Time-release', 'Coated options']
  },
  {
    id: 'softgels',
    name: 'Softgels',
    description: 'Easy-to-swallow liquid filled',
    icon: '🟡',
    features: ['Various sizes', 'Custom shapes', 'Clear or opaque', 'Enteric coating']
  },
  {
    id: 'powders',
    name: 'Powders',
    description: 'Tubs and stick pack options',
    icon: '🥤',
    features: ['Bulk tubs', 'Single-serve sticks', 'Custom flavoring', 'Instant mixing']
  },
  {
    id: 'gummies',
    name: 'Gummies',
    description: 'Delicious and fun formats',
    icon: '🍬',
    features: ['Custom shapes', 'Natural flavors', 'Pectin-based', 'Sugar-free options']
  },
  {
    id: 'liquids',
    name: 'Liquids & Tinctures',
    description: 'Drops and liquid supplements',
    icon: '💧',
    features: ['Dropper bottles', 'Spray options', 'Flavored syrups', 'Concentrated formulas']
  }
];

export const productionDetails = {
  moq: {
    title: 'Minimum Order Quantities',
    details: [
      { format: 'Capsules & Tablets', quantity: '1000 bottles' },
      { format: 'Powders', quantity: '1000 units' },
      { format: 'Gummies', quantity: '1,000 bottles' },
      { format: 'Liquids', quantity: '1000 bottles' },
      { format: 'Custom Formulations', quantity: 'Contact for details' }
    ]
  },
  leadTimes: {
    title: 'Production Lead Times',
    details: [
      { type: 'First Production Run', time: '8-10 weeks' },
      { type: 'Repeat Orders', time: '6-8 weeks' },
      { type: 'Rush Production', time: '4-6 weeks (additional fees apply)' },
      { type: 'Stock Formulas', time: '4-5 weeks' }
    ]
  },
  facility: {
    title: 'Facility Information',
    features: [
      'GMP-certified manufacturing facility',
      'FDA-registered establishment',
      'Climate-controlled warehousing',
      '60,000 sq. ft. production space',
      'State-of-the-art equipment',
      'Clean room environments'
    ]
  }
};