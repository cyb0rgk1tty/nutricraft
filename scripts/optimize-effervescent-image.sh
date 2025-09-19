#!/bin/bash

# Script to optimize the effervescent formulation image

cd /var/www/Nutricraft/public/images/formulations

# Create different sizes for responsive loading
echo "Processing effervescent image..."

# 400px width for mobile
convert effervescent.png -resize 400x -quality 85 effervescent-400.png
convert effervescent.png -resize 400x -quality 85 -define webp:method=6 effervescent-400.webp

# 800px width for tablets
convert effervescent.png -resize 800x -quality 85 effervescent-800.png
convert effervescent.png -resize 800x -quality 85 -define webp:method=6 effervescent-800.webp

# 1200px width for desktop
convert effervescent.png -resize 1200x -quality 85 effervescent-1200.png
convert effervescent.png -resize 1200x -quality 85 -define webp:method=6 effervescent-1200.webp

echo "Effervescent image optimization complete!"

# List the generated files
echo -e "\nGenerated files:"
ls -la effervescent-*.{png,webp} 2>/dev/null