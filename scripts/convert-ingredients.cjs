#!/usr/bin/env node

/**
 * Convert keyIngredients strings to structured ingredients arrays
 * Parses formats like "Magnesium Citrate 100mg" into { name, amount, unit, source }
 */

const fs = require('fs');
const path = require('path');

// Read the products file
const productsPath = path.join(__dirname, '../src/data/products.js');
let content = fs.readFileSync(productsPath, 'utf8');

/**
 * Parse a keyIngredient string into structured format
 * Examples:
 *   "Magnesium Citrate 100mg" -> { name: "Magnesium", amount: "100", unit: "mg", source: "(as Magnesium Citrate)" }
 *   "Vitamin B12 1000mcg" -> { name: "Vitamin B12", amount: "1000", unit: "mcg" }
 *   "Proprietary Blend 760mg (Lemon Balm, ...)" -> { name: "Proprietary Blend", amount: "760", unit: "mg", source: "(Lemon Balm, ...)" }
 */
function parseIngredient(str) {
  str = str.trim();

  // Handle proprietary blends with parentheses
  const blendMatch = str.match(/^(.+?)\s+([\d,.]+)\s*(mg|mcg|g|IU|Billion CFU|CFU)\s*\((.+)\)$/i);
  if (blendMatch) {
    return {
      name: blendMatch[1].trim(),
      amount: blendMatch[2].replace(',', ''),
      unit: blendMatch[3],
      dailyValue: '*',
      source: `(${blendMatch[4].trim()})`
    };
  }

  // Standard format: "Name Amount Unit"
  // Match patterns like "Vitamin B12 1000mcg", "L-Theanine 100mg", "Magnesium Glycinate 200mg"
  const standardMatch = str.match(/^(.+?)\s+([\d,.]+)\s*(mg|mcg|g|IU|Billion CFU|CFU)$/i);
  if (standardMatch) {
    let name = standardMatch[1].trim();
    const amount = standardMatch[2].replace(',', '');
    const unit = standardMatch[3];

    // Check if name contains source info (like "Magnesium Glycinate" or "Vitamin D3")
    let source = null;

    // Common patterns where the form is part of the name
    const sourcePatterns = [
      { regex: /^(Magnesium)\s+(Glycinate|Citrate|Oxide|Bisglycinate|L-Threonate)$/i, format: 'as' },
      { regex: /^(Zinc)\s+(Citrate|Bisglycinate|Picolinate|Gluconate)$/i, format: 'as' },
      { regex: /^(Iron)\s+(Bisglycinate|Ferrous\s+\w+)$/i, format: 'as' },
      { regex: /^(Calcium)\s+(Citrate|Carbonate|Bisglycinate)$/i, format: 'as' },
      { regex: /^(Vitamin\s+D3?)$/i, format: null },
      { regex: /^(Vitamin\s+B\d+)$/i, format: null },
      { regex: /^(Vitamin\s+[A-Z])$/i, format: null },
      { regex: /^(.+)\s+Extract$/i, format: 'extract' },
      { regex: /^(.+)\s+Root\s+Extract$/i, format: 'root extract' },
      { regex: /^(.+)\s+Leaf\s+Extract$/i, format: 'leaf extract' },
    ];

    for (const pattern of sourcePatterns) {
      const match = name.match(pattern.regex);
      if (match && pattern.format === 'as') {
        source = `(as ${name})`;
        name = match[1];
        break;
      }
    }

    const result = {
      name,
      amount,
      unit,
      dailyValue: '*'
    };

    if (source) {
      result.source = source;
    }

    return result;
  }

  // Fallback: just use the whole string as the name
  return {
    name: str,
    amount: '',
    unit: '',
    dailyValue: '*'
  };
}

/**
 * Convert keyIngredients array to ingredients array
 */
function convertKeyIngredients(keyIngredients) {
  if (!keyIngredients || !Array.isArray(keyIngredients)) {
    return [];
  }

  return keyIngredients.map(parseIngredient).filter(ing => ing.name);
}

// Parse the products array from the file
// Extract products array using regex
const productsMatch = content.match(/export const products = \[([\s\S]*?)\];/);
if (!productsMatch) {
  console.error('Could not find products array in file');
  process.exit(1);
}

// For each product, add ingredients array based on keyIngredients
// We'll do this by modifying the file content directly

// Find all keyIngredients arrays and add ingredients after them
let modified = content;

// Match pattern: keyIngredients: [...],
const keyIngredientsPattern = /keyIngredients:\s*\[([\s\S]*?)\],?\s*\n(\s*)dosageForm/g;

let match;
let replacements = [];

while ((match = keyIngredientsPattern.exec(content)) !== null) {
  const fullMatch = match[0];
  const arrayContent = match[1];
  const indent = match[2];

  // Parse the array content to get individual ingredients
  // Match strings in single or double quotes
  const stringPattern = /['"]([^'"]+)['"]/g;
  const ingredients = [];
  let strMatch;
  while ((strMatch = stringPattern.exec(arrayContent)) !== null) {
    ingredients.push(strMatch[1]);
  }

  // Convert to structured format
  const structuredIngredients = convertKeyIngredients(ingredients);

  // Format the ingredients array
  const ingredientsStr = structuredIngredients.map(ing => {
    const parts = [`      { name: '${ing.name.replace(/'/g, "\\'")}', amount: '${ing.amount}', unit: '${ing.unit}', dailyValue: '${ing.dailyValue}'`];
    if (ing.source) {
      parts.push(`, source: '${ing.source.replace(/'/g, "\\'")}'`);
    }
    parts.push(' }');
    return parts.join('');
  }).join(',\n');

  // Create replacement with ingredients array
  const replacement = `keyIngredients: [${arrayContent}],
    ingredients: [
${ingredientsStr}
    ],
    otherIngredients: 'Vegetable cellulose (capsule), rice flour, magnesium stearate.',
${indent}dosageForm`;

  replacements.push({ original: fullMatch, replacement });
}

// Apply replacements (in reverse order to maintain positions)
for (const { original, replacement } of replacements.reverse()) {
  modified = modified.replace(original, replacement);
}

// Write the modified content back
fs.writeFileSync(productsPath, modified, 'utf8');

console.log(`Converted ${replacements.length} products with ingredients arrays`);
