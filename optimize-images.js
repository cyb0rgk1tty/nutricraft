import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImage() {
  const inputPath = './public/images/thewellnessdropbottle.png';
  const outputDir = './public/images/';
  
  try {
    // Create optimized PNG versions
    console.log('Creating optimized PNG versions...');
    
    // 500x500 version (1x)
    await sharp(inputPath)
      .resize(500, 500, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'thewellnessdropbottle-500.png'));
    
    // 1000x1000 version (2x for retina)
    await sharp(inputPath)
      .resize(1000, 1000, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'thewellnessdropbottle-1000.png'));
    
    // Create WebP versions for better compression
    console.log('Creating WebP versions...');
    
    // 500x500 WebP
    await sharp(inputPath)
      .resize(500, 500, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, 'thewellnessdropbottle-500.webp'));
    
    // 1000x1000 WebP
    await sharp(inputPath)
      .resize(1000, 1000, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, 'thewellnessdropbottle-1000.webp'));
    
    // Optimize the original size but with better compression
    await sharp(inputPath)
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'thewellnessdropbottle-optimized.png'));
    
    // Get file sizes for comparison
    const originalStats = await fs.stat(inputPath);
    const optimized500Stats = await fs.stat(path.join(outputDir, 'thewellnessdropbottle-500.png'));
    const webp500Stats = await fs.stat(path.join(outputDir, 'thewellnessdropbottle-500.webp'));
    
    console.log('\nOptimization complete!');
    console.log('Original:', (originalStats.size / 1024).toFixed(2), 'KB');
    console.log('500px PNG:', (optimized500Stats.size / 1024).toFixed(2), 'KB');
    console.log('500px WebP:', (webp500Stats.size / 1024).toFixed(2), 'KB');
    console.log('Savings:', ((1 - webp500Stats.size / originalStats.size) * 100).toFixed(2), '%');
    
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}

optimizeImage();