#!/bin/bash

# Create directories if they don't exist
cd /var/www/nutricraft/public/images
mkdir -p formulations

# Array of image names to process
images=("whitetabs" "whitecaps" "softgels" "gummies" "powder" "liquid")

# Process each image
for img in "${images[@]}"; do
    echo "Processing $img.png..."
    
    # Create different sizes using sharp-cli
    # 400x400 for mobile
    npx sharp-cli resize 400 400 --input "${img}.png" --output "formulations/${img}-400.png"
    
    # 800x800 for tablet
    npx sharp-cli resize 800 800 --input "${img}.png" --output "formulations/${img}-800.png"
    
    # 1200x1200 for desktop (resize larger ones down)
    npx sharp-cli resize 1200 1200 --input "${img}.png" --output "formulations/${img}-1200.png"
    
    # Create WebP versions of each size
    npx imagemin-webp "formulations/${img}-400.png" > "formulations/${img}-400.webp"
    npx imagemin-webp "formulations/${img}-800.png" > "formulations/${img}-800.webp"
    npx imagemin-webp "formulations/${img}-1200.png" > "formulations/${img}-1200.webp"
    
    # Optimize PNG versions
    npx imagemin-pngquant "formulations/${img}-400.png" > "formulations/${img}-400-opt.png"
    mv "formulations/${img}-400-opt.png" "formulations/${img}-400.png"
    
    npx imagemin-pngquant "formulations/${img}-800.png" > "formulations/${img}-800-opt.png"
    mv "formulations/${img}-800-opt.png" "formulations/${img}-800.png"
    
    npx imagemin-pngquant "formulations/${img}-1200.png" > "formulations/${img}-1200-opt.png"
    mv "formulations/${img}-1200-opt.png" "formulations/${img}-1200.png"
    
    echo "Completed processing $img.png"
    echo "---"
done

echo "All images processed successfully!"
echo "Files created in /var/www/nutricraft/public/images/formulations/"
ls -la formulations/