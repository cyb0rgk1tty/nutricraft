#!/bin/bash

# Script to optimize the ODT formulation image

cd /var/www/Nutricraft/public/images/formulations

# Create different sizes for responsive loading
echo "Processing ODT image..."

# 400px width for mobile
convert odt.png -resize 400x -quality 90 -background white -flatten odt-400.jpg
convert odt.png -resize 400x -quality 85 -define webp:method=6 odt-400.webp

# 800px width for tablets
convert odt.png -resize 800x -quality 90 -background white -flatten odt-800.jpg
convert odt.png -resize 800x -quality 85 -define webp:method=6 odt-800.webp

# 1200px width for desktop
convert odt.png -resize 1200x -quality 90 -background white -flatten odt-1200.jpg
convert odt.png -resize 1200x -quality 85 -define webp:method=6 odt-1200.webp

echo "ODT image optimization complete!"

# Create article images
echo "Creating article images..."
cd articles

# Copy images from main directory
cp ../odt-400.jpg odt-400.jpg
cp ../odt-800.jpg odt-800.jpg
cp ../odt-1200.jpg odt-1200.jpg
cp ../odt-400.webp odt-400.webp
cp ../odt-800.webp odt-800.webp
cp ../odt-1200.webp odt-1200.webp

echo "Article images created!"

# List the generated files
echo -e "\nGenerated files:"
cd ..
ls -la odt-*.{jpg,webp} 2>/dev/null