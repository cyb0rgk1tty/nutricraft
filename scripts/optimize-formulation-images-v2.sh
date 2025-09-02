#!/bin/bash

# Navigate to the images directory
cd /var/www/nutricraft/public/images

# Array of image names to process
images=("whitetabs" "whitecaps" "softgels" "gummies" "powder" "liquid")

# Process each image
for img in "${images[@]}"; do
    echo "Processing $img.png..."
    
    # Create different sizes using sharp-cli directly
    # 400x400 for mobile
    node /var/www/nutricraft/node_modules/.bin/sharp resize 400 400 --input "${img}.png" --output "formulations/${img}-400.png"
    
    # 800x800 for tablet
    node /var/www/nutricraft/node_modules/.bin/sharp resize 800 800 --input "${img}.png" --output "formulations/${img}-800.png"
    
    # 1200x1200 for desktop (resize larger ones down)
    node /var/www/nutricraft/node_modules/.bin/sharp resize 1200 1200 --input "${img}.png" --output "formulations/${img}-1200.png"
    
    # Create WebP versions using cwebp if available, or imagemin
    if command -v cwebp &> /dev/null; then
        cwebp -q 85 "formulations/${img}-400.png" -o "formulations/${img}-400.webp"
        cwebp -q 85 "formulations/${img}-800.png" -o "formulations/${img}-800.webp"
        cwebp -q 85 "formulations/${img}-1200.png" -o "formulations/${img}-1200.webp"
    else
        # Use imagemin-webp as fallback
        node /var/www/nutricraft/node_modules/.bin/imagemin "formulations/${img}-400.png" --plugin=webp --out-dir=formulations
        node /var/www/nutricraft/node_modules/.bin/imagemin "formulations/${img}-800.png" --plugin=webp --out-dir=formulations
        node /var/www/nutricraft/node_modules/.bin/imagemin "formulations/${img}-1200.png" --plugin=webp --out-dir=formulations
    fi
    
    # Optimize PNG versions
    node /var/www/nutricraft/node_modules/.bin/imagemin "formulations/${img}-400.png" --plugin=pngquant --out-dir=formulations
    node /var/www/nutricraft/node_modules/.bin/imagemin "formulations/${img}-800.png" --plugin=pngquant --out-dir=formulations
    node /var/www/nutricraft/node_modules/.bin/imagemin "formulations/${img}-1200.png" --plugin=pngquant --out-dir=formulations
    
    echo "Completed processing $img.png"
    echo "---"
done

echo "All images processed successfully!"
echo "Files created in /var/www/nutricraft/public/images/formulations/"
ls -lh formulations/*.{png,webp} 2>/dev/null | head -20