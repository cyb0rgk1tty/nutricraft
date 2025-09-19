#!/bin/bash

# Script to remove all PNG files after conversion to JPG
# This will clean up the formulations directory

echo "PNG File Cleanup Script"
echo "======================"
echo ""
echo "This script will remove all PNG files from the formulations directory"
echo "Make sure the site is working correctly with JPG images before running this!"
echo ""
read -p "Are you sure you want to remove all PNG files? (y/N): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

cd /var/www/Nutricraft/public/images/formulations

echo -e "\nRemoving PNG files from main directory..."
removed_main=0
for png in *.png; do
    if [[ -f "$png" ]]; then
        echo "Removing: $png"
        rm "$png"
        ((removed_main++))
    fi
done

echo -e "\nRemoving PNG files from articles directory..."
removed_articles=0
cd articles
for png in *.png; do
    if [[ -f "$png" ]]; then
        echo "Removing: $png"
        rm "$png"
        ((removed_articles++))
    fi
done

# Also remove the placeholder-info.txt if it exists
cd ..
if [[ -f "placeholder-info.txt" ]]; then
    echo -e "\nRemoving placeholder-info.txt"
    rm "placeholder-info.txt"
fi

total_removed=$((removed_main + removed_articles))
echo -e "\n======================"
echo "Cleanup complete!"
echo "Removed $removed_main PNG files from main directory"
echo "Removed $removed_articles PNG files from articles directory"
echo "Total PNG files removed: $total_removed"
echo ""
echo "Remaining files in main directory:"
ls -la | grep -E "\.(jpg|webp)$" | wc -l
echo ""
echo "Remaining files in articles directory:"
ls -la articles/ | grep -E "\.(jpg|webp)$" | wc -l