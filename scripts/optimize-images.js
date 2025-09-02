import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminWebp from 'imagemin-webp';
import path from 'path';
import { promises as fs } from 'fs';

const inputDir = '/var/www/nutricraft/public/images';
const outputDir = '/var/www/nutricraft/public/images/formulations';

const images = ['whitetabs', 'whitecaps', 'softgels', 'gummies', 'powder', 'liquid'];
const sizes = [400, 800, 1200];

async function processImage(imageName) {
  console.log(`Processing ${imageName}.png...`);
  
  const inputPath = path.join(inputDir, `${imageName}.png`);
  
  // Process each size
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${imageName}-${size}.png`);
    
    try {
      // Resize image
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  Created ${imageName}-${size}.png`);
      
      // Create WebP version
      const webpPath = path.join(outputDir, `${imageName}-${size}.webp`);
      await sharp(outputPath)
        .webp({ quality: 85 })
        .toFile(webpPath);
      
      console.log(`  Created ${imageName}-${size}.webp`);
      
      // Optimize PNG with pngquant
      const optimizedBuffer = await imagemin.buffer(
        await fs.readFile(outputPath),
        {
          plugins: [
            imageminPngquant({
              quality: [0.6, 0.8]
            })
          ]
        }
      );
      
      await fs.writeFile(outputPath, optimizedBuffer);
      console.log(`  Optimized ${imageName}-${size}.png`);
      
    } catch (error) {
      console.error(`Error processing ${imageName} at ${size}px:`, error.message);
    }
  }
  
  console.log(`Completed ${imageName}\n`);
}

async function main() {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Process all images
  for (const image of images) {
    await processImage(image);
  }
  
  console.log('All images processed successfully!');
  
  // List files
  const files = await fs.readdir(outputDir);
  console.log('\nCreated files:');
  for (const file of files.sort()) {
    if (file.endsWith('.png') || file.endsWith('.webp')) {
      const stats = await fs.stat(path.join(outputDir, file));
      console.log(`  ${file} - ${(stats.size / 1024).toFixed(1)}KB`);
    }
  }
}

main().catch(console.error);