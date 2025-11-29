#!/usr/bin/env node

/**
 * Add SKU codes to all products in products.js
 * Format: VENDOR-DOSAGEFORM+NUMBER (e.g., DUR-C001 for first capsule)
 *
 * Dosage form codes:
 * C = Capsules
 * G = Gummies
 * P = Powder
 * S = Softgels
 * H = Honey stick
 * T = Tablets
 * R = Resin
 */

const fs = require('fs');
const path = require('path');

// Vendor prefix for current products
const VENDOR_PREFIX = 'DUR';

// Dosage form to letter mapping
const dosageFormCodes = {
  'capsules': 'C',
  'gummies': 'G',
  'powder': 'P',
  'softgels': 'S',
  'honey stick': 'H',
  'tablets': 'T',
  'resin': 'R'
};

// Read the products file
const productsPath = path.join(__dirname, '../src/data/products.js');
let content = fs.readFileSync(productsPath, 'utf8');

// Track counters for each dosage form
const counters = {};

// Process each product - find id: line and add sku: after it
// We need to find each product block and get its dosageForm

// Match products array content
const productsArrayMatch = content.match(/export const products = \[([\s\S]*)\];[\s\S]*$/);
if (!productsArrayMatch) {
  console.error('Could not find products array');
  process.exit(1);
}

// Split content into before products, products array, and after
const productsStart = content.indexOf('export const products = [');
const beforeProducts = content.substring(0, productsStart + 'export const products = ['.length);

// Find the closing ];
let bracketCount = 1;
let productsEnd = productsStart + 'export const products = ['.length;
for (let i = productsEnd; i < content.length && bracketCount > 0; i++) {
  if (content[i] === '[') bracketCount++;
  if (content[i] === ']') bracketCount--;
  if (bracketCount === 0) {
    productsEnd = i;
    break;
  }
}

const productsContent = content.substring(productsStart + 'export const products = ['.length, productsEnd);
const afterProducts = content.substring(productsEnd);

// Parse each product object
// Products are separated by },\n  {
const productRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
let match;
let newProductsContent = '';
let lastIndex = 0;
let updatedCount = 0;

while ((match = productRegex.exec(productsContent)) !== null) {
  const productContent = match[1];

  // Check if this is actually a product (has id: and dosageForm:)
  if (!productContent.includes("id:") || !productContent.includes("dosageForm:")) {
    continue;
  }

  // Skip if already has sku:
  if (productContent.includes("sku:")) {
    continue;
  }

  // Extract dosageForm
  const dosageMatch = productContent.match(/dosageForm:\s*['"]([^'"]+)['"]/);
  const dosageForm = dosageMatch ? dosageMatch[1].toLowerCase() : 'capsules';

  // Get the letter code
  const letterCode = dosageFormCodes[dosageForm] || 'X';

  // Increment counter for this dosage form
  counters[dosageForm] = (counters[dosageForm] || 0) + 1;

  // Generate SKU
  const sku = `${VENDOR_PREFIX}-${letterCode}${String(counters[dosageForm]).padStart(3, '0')}`;

  // Add sku after the id line
  const newProductContent = productContent.replace(
    /(id:\s*['"][^'"]+['"],?\n)/,
    `$1    sku: '${sku}',\n`
  );

  // Add the content before this match, then the modified product
  newProductsContent += productsContent.substring(lastIndex, match.index);
  newProductsContent += '{' + newProductContent + '}';
  lastIndex = match.index + match[0].length;
  updatedCount++;
}

// Add any remaining content
newProductsContent += productsContent.substring(lastIndex);

// Reconstruct the file
const newContent = beforeProducts + newProductsContent + afterProducts;

// Write the modified content back
fs.writeFileSync(productsPath, newContent, 'utf8');

console.log('SKU codes added:');
Object.entries(counters).forEach(([form, count]) => {
  const code = dosageFormCodes[form] || 'X';
  console.log(`  ${form}: ${VENDOR_PREFIX}-${code}001 to ${VENDOR_PREFIX}-${code}${String(count).padStart(3, '0')}`);
});
console.log(`\nTotal: ${updatedCount} products updated`);
