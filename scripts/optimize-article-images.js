#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const SIZES = [
  { width: 400, suffix: '-400' },
  { width: 800, suffix: '-800' },
  { width: 1200, suffix: '-1200' }
];

const INPUT_DIR = path.join(process.cwd(), 'articles');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'formulations', 'articles');

async function ensureDirectory(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function processImage(inputPath, filename) {
  const basename = path.basename(filename, '.png');
  
  console.log(`Processing ${filename}...`);
  
  // Process each size
  for (const size of SIZES) {
    // PNG version
    await sharp(inputPath)
      .resize(size.width, null, { withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(path.join(OUTPUT_DIR, `${basename}${size.suffix}.png`));
      
    // WebP version
    await sharp(inputPath)
      .resize(size.width, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(OUTPUT_DIR, `${basename}${size.suffix}.webp`));
  }
  
  // Also save an optimized original
  await sharp(inputPath)
    .png({ quality: 85, compressionLevel: 9 })
    .toFile(path.join(OUTPUT_DIR, `${basename}-original.png`));
    
  console.log(`Completed ${filename}`);
}

async function main() {
  try {
    // Ensure output directory exists
    await ensureDirectory(OUTPUT_DIR);
    
    // Get all PNG files from the articles directory
    const files = await fs.readdir(INPUT_DIR);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    if (pngFiles.length === 0) {
      console.log('No PNG files found in the articles directory');
      return;
    }
    
    // Process each image
    for (const file of pngFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      await processImage(inputPath, file);
    }
    
    console.log('\nAll images have been processed and optimized!');
    console.log(`Images are available in: ${OUTPUT_DIR}`);
    
    // List generated files
    const outputFiles = await fs.readdir(OUTPUT_DIR);
    console.log('\nGenerated files:');
    outputFiles.forEach(file => console.log(`  ${file}`));
    
  } catch (error) {
    console.error('Error processing images:', error);
    process.exit(1);
  }
}

main();