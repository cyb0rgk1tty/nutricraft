#!/bin/bash

# Script to convert all PNG formulation images to JPG format
# This will create optimized JPG versions and then we'll remove the PNGs

echo "Starting PNG to JPG conversion for formulation images..."
echo "=================================================="

# Change to formulations directory
cd /var/www/Nutricraft/public/images/formulations

# Counter for processed files
converted=0

# Convert main formulation PNGs to JPGs
for png in *.png; do
    if [[ -f "$png" && "$png" != "placeholder-info.txt" ]]; then
        # Get the base name without extension
        base="${png%.png}"
        
        # Skip if JPG already exists
        if [[ -f "${base}.jpg" ]]; then
            echo "Skipping $png - JPG already exists"
            continue
        fi
        
        # Convert PNG to high-quality JPG
        echo "Converting $png to ${base}.jpg"
        convert "$png" -quality 90 -background white -flatten "${base}.jpg"
        ((converted++))
    fi
done

echo -e "\nProcessing article images..."
cd articles

# Convert article PNGs to JPGs
for png in *.png; do
    if [[ -f "$png" ]]; then
        # Get the base name without extension
        base="${png%.png}"
        
        # Skip if JPG already exists
        if [[ -f "${base}.jpg" ]]; then
            echo "Skipping $png - JPG already exists"
            continue
        fi
        
        # Convert PNG to high-quality JPG
        echo "Converting $png to ${base}.jpg"
        convert "$png" -quality 90 -background white -flatten "${base}.jpg"
        ((converted++))
    fi
done

echo -e "\n=================================================="
echo "Conversion complete! Converted $converted PNG files to JPG."
echo ""
echo "Generated JPG files in main directory:"
cd ..
ls -la *.jpg 2>/dev/null | head -20
echo ""
echo "Generated JPG files in articles directory:"
ls -la articles/*.jpg 2>/dev/null | head -20

echo -e "\n=================================================="
echo "Next steps:"
echo "1. Update formulations.js to reference .jpg instead of .png"
echo "2. Verify all images load correctly"
echo "3. Run cleanup script to remove PNG files"