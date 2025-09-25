#!/bin/bash

# Script to optimize private label images for the hero section
# Converts PNG to WebP and JPG formats in multiple sizes

cd /var/www/nutricraft/public/images

# Define source images and their new names
declare -A images=(
    ["bag_private_label_rembg.png"]="private-label-bag"
    ["protein_private_label_rembg.png"]="private-label-protein"
)

# Define sizes for responsive images
sizes=(500 1000 1500)

echo "Starting private label image optimization..."

for source in "${!images[@]}"; do
    target="${images[$source]}"

    if [ ! -f "$source" ]; then
        echo "Warning: $source not found, skipping..."
        continue
    fi

    echo "Processing $source -> $target"

    for size in "${sizes[@]}"; do
        echo "  Creating ${size}px versions..."

        # Create resized JPG version (with white background for transparency)
        convert "$source" \
            -background white \
            -alpha remove \
            -alpha off \
            -resize "${size}x${size}" \
            -quality 85 \
            "${target}-${size}.jpg"

        # Create WebP version using cwebp if available, otherwise use convert
        if command -v cwebp &> /dev/null; then
            cwebp -q 80 "${target}-${size}.jpg" -o "${target}-${size}.webp"
        else
            convert "${target}-${size}.jpg" \
                -quality 80 \
                "${target}-${size}.webp"
        fi

        # Get file sizes for comparison
        jpg_size=$(du -h "${target}-${size}.jpg" | cut -f1)
        webp_size=$(du -h "${target}-${size}.webp" | cut -f1)

        echo "    ✓ ${target}-${size}.jpg (${jpg_size})"
        echo "    ✓ ${target}-${size}.webp (${webp_size})"
    done

    echo "  Completed $target"
    echo ""
done

# Also ensure the existing hero image has all needed sizes
if [ -f "private-label-hero-500.png" ]; then
    echo "Processing existing hero image to JPG/WebP..."

    for size in "${sizes[@]}"; do
        # Check if we need to create this size
        if [ ! -f "private-label-hero-${size}.jpg" ]; then
            if [ -f "private-label-hero-${size}.png" ]; then
                # Convert existing PNG to JPG
                convert "private-label-hero-${size}.png" \
                    -background white \
                    -alpha remove \
                    -alpha off \
                    -quality 85 \
                    "private-label-hero-${size}.jpg"
            elif [ -f "private-label-hero-500.png" ]; then
                # Resize from 500px version
                convert "private-label-hero-500.png" \
                    -background white \
                    -alpha remove \
                    -alpha off \
                    -resize "${size}x${size}" \
                    -quality 85 \
                    "private-label-hero-${size}.jpg"
            fi

            # Create WebP if JPG was created
            if [ -f "private-label-hero-${size}.jpg" ]; then
                if command -v cwebp &> /dev/null; then
                    cwebp -q 80 "private-label-hero-${size}.jpg" -o "private-label-hero-${size}.webp"
                else
                    convert "private-label-hero-${size}.jpg" \
                        -quality 80 \
                        "private-label-hero-${size}.webp"
                fi
            fi
        fi
    done
fi

echo "==================================="
echo "Image optimization complete!"
echo ""
echo "Generated files:"
ls -lah private-label-*.{jpg,webp} 2>/dev/null | grep -E "\.(jpg|webp)$"
echo "==================================="