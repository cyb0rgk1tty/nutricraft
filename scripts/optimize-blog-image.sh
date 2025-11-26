#!/bin/bash
# Usage: ./optimize-blog-image.sh <input-file> <output-basename>
# Example: ./optimize-blog-image.sh /tmp/raw.png glp1-hero

INPUT_FILE=$1
BASE_NAME=$2
OUTPUT_DIR="/var/www/nutricraft/public/images/blog"

if [ -z "$INPUT_FILE" ] || [ -z "$BASE_NAME" ]; then
    echo "Usage: $0 <input-file> <output-basename>"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Define the three tiers
SIZES=(400 800 1200)

echo "Processing $INPUT_FILE -> $BASE_NAME"

for SIZE in "${SIZES[@]}"; do
    echo "  Creating ${SIZE}px versions..."

    # Create JPG version (with white background for any transparency)
    convert "$INPUT_FILE" \
        -background white \
        -alpha remove \
        -alpha off \
        -resize "${SIZE}x" \
        -quality 85 \
        "$OUTPUT_DIR/${BASE_NAME}-${SIZE}.jpg"

    # Create WebP version
    convert "$INPUT_FILE" \
        -resize "${SIZE}x" \
        -quality 80 \
        -define webp:method=6 \
        "$OUTPUT_DIR/${BASE_NAME}-${SIZE}.webp"

    # Report file sizes
    JPG_SIZE=$(du -h "$OUTPUT_DIR/${BASE_NAME}-${SIZE}.jpg" | cut -f1)
    WEBP_SIZE=$(du -h "$OUTPUT_DIR/${BASE_NAME}-${SIZE}.webp" | cut -f1)

    echo "    ${BASE_NAME}-${SIZE}.jpg (${JPG_SIZE})"
    echo "    ${BASE_NAME}-${SIZE}.webp (${WEBP_SIZE})"
done

echo ""
echo "Generated files:"
ls -la "$OUTPUT_DIR/${BASE_NAME}"*
