#!/bin/bash

# Script to optimize the chewables formulation image

cd /var/www/Nutricraft/public/images/formulations

# Check if chewables.png exists
if [ ! -f "chewables.png" ]; then
    echo "Error: chewables.png not found in /var/www/Nutricraft/public/images/formulations"
    exit 1
fi

# Create different sizes for responsive loading
echo "Processing chewables image..."

# 400px width for mobile
convert chewables.png -resize 400x -quality 85 chewables-400.png
convert chewables.png -resize 400x -quality 85 -define webp:method=6 chewables-400.webp

# 800px width for tablets
convert chewables.png -resize 800x -quality 85 chewables-800.png
convert chewables.png -resize 800x -quality 85 -define webp:method=6 chewables-800.webp

# 1200px width for desktop
convert chewables.png -resize 1200x -quality 85 chewables-1200.png
convert chewables.png -resize 1200x -quality 85 -define webp:method=6 chewables-1200.webp

echo "Chewables image optimization complete!"

# List the generated files
echo -e "\nGenerated files:"
ls -la chewables-*.{png,webp} 2>/dev/null