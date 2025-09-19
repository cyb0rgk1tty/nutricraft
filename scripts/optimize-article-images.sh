#!/bin/bash

# Script to optimize formulation article images
# Converts PNG to WebP and creates multiple sizes for responsive loading

# Create the article images directory if it doesn't exist
mkdir -p public/images/formulations/articles

# Function to process a single image
process_image() {
    local input_file=$1
    local base_name=$(basename "$input_file" .png)
    local output_dir="public/images/formulations/articles"
    
    echo "Processing $base_name..."
    
    # Create different sizes for responsive loading
    # 400px width for mobile
    convert "$input_file" -resize 400x -quality 85 "$output_dir/${base_name}-400.png"
    convert "$input_file" -resize 400x -quality 85 -define webp:method=6 "$output_dir/${base_name}-400.webp"
    
    # 800px width for tablets
    convert "$input_file" -resize 800x -quality 85 "$output_dir/${base_name}-800.png"
    convert "$input_file" -resize 800x -quality 85 -define webp:method=6 "$output_dir/${base_name}-800.webp"
    
    # 1200px width for desktop
    convert "$input_file" -resize 1200x -quality 85 "$output_dir/${base_name}-1200.png"
    convert "$input_file" -resize 1200x -quality 85 -define webp:method=6 "$output_dir/${base_name}-1200.webp"
    
    # Copy original as well (but optimized)
    convert "$input_file" -quality 85 "$output_dir/${base_name}-original.png"
    
    echo "Completed processing $base_name"
}

# Process all PNG files in the articles directory
for image in articles/*.png; do
    if [[ -f "$image" ]]; then
        process_image "$image"
    fi
done

echo "All images have been processed and optimized!"
echo "Images are now available in: public/images/formulations/articles/"

# Show the generated files
echo -e "\nGenerated files:"
ls -la public/images/formulations/articles/