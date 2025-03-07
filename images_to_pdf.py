#!/usr/bin/env python3
import os
import re
import argparse
import glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def extract_page_number(filename):
    """Extract page number from filename (e.g., '1.jpg' -> 1)"""
    match = re.match(r'(\d+)\.[a-zA-Z]+$', os.path.basename(filename))
    if match:
        return int(match.group(1))
    return None

def images_to_pdf(input_dir='./input', output_file='output.pdf', page_size=letter):
    """Convert images in input_dir to a single PDF file"""
    # Check if input directory exists
    if not os.path.isdir(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        return False
    
    # Get all image files
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
    image_files = []
    for ext in image_extensions:
        image_files.extend(glob.glob(os.path.join(input_dir, ext)))
    
    if not image_files:
        print(f"Error: No image files found in '{input_dir}'.")
        return False
    
    # Sort files by page number
    valid_images = []
    for img_path in image_files:
        page_num = extract_page_number(img_path)
        if page_num is not None:
            valid_images.append((page_num, img_path))
    
    if not valid_images:
        print("Error: No valid image files with numeric names found.")
        return False
    
    # Sort by page number
    valid_images.sort(key=lambda x: x[0])
    
    # Create PDF
    c = canvas.Canvas(output_file, pagesize=page_size)
    
    for page_num, img_path in valid_images:
        try:
            img = Image.open(img_path)
            width, height = img.size
            
            # Adjust image size to fit page while maintaining aspect ratio
            page_width, page_height = page_size
            ratio = min(page_width / width, page_height / height)
            new_width = width * ratio
            new_height = height * ratio
            
            # Center image on page
            x_offset = (page_width - new_width) / 2
            y_offset = (page_height - new_height) / 2
            
            # Add image to PDF
            c.drawImage(img_path, x_offset, y_offset, width=new_width, height=new_height)
            
            # Add a new page for the next image (except for the last one)
            if page_num < valid_images[-1][0]:
                c.showPage()
                
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
    
    # Save the PDF
    c.save()
    print(f"PDF created successfully: {output_file}")
    print(f"Included {len(valid_images)} pages in order: {[page for page, _ in valid_images]}")
    return True

def create_test_images(directory='./input', num_images=5):
    """Create test images with page numbers for demonstration"""
    # Create directory if it doesn't exist
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # Image dimensions
    width, height = 800, 1000
    
    # Create sample images
    for i in range(num_images):
        # Create a blank image with random background color
        bg_color = tuple(np.random.randint(200, 256, 3))
        img = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to load a font, fall back to default if not available
        try:
            font = ImageFont.truetype("Arial", 120)
        except IOError:
            font = ImageFont.load_default()
        
        # Draw page number
        text = f"Page {i}"
        text_width = draw.textlength(text, font=font)
        text_position = ((width - text_width) // 2, height // 2 - 60)
        draw.text(text_position, text, fill=(0, 0, 0), font=font)
        
        # Draw some decorative elements
        draw.rectangle([(50, 50), (width-50, height-50)], outline=(0, 0, 0), width=5)
        
        # Add some circles with random colors
        for _ in range(5):
            x = np.random.randint(100, width-100)
            y = np.random.randint(100, height-100)
            r = np.random.randint(20, 50)
            circle_color = tuple(np.random.randint(0, 200, 3))
            draw.ellipse((x-r, y-r, x+r, y+r), fill=circle_color)
        
        # Save the image
        filename = os.path.join(directory, f"{i}.jpg")
        img.save(filename)
        print(f"Created test image: {filename}")

def main():
    parser = argparse.ArgumentParser(description='Convert images to PDF based on filename page numbers.')
    parser.add_argument('-i', '--input', default='./input', help='Input directory containing images (default: ./input)')
    parser.add_argument('-o', '--output', default='output.pdf', help='Output PDF filename (default: output.pdf)')
    parser.add_argument('-t', '--test', action='store_true', help='Generate test images before creating PDF')
    parser.add_argument('-n', '--num-test-images', type=int, default=5, help='Number of test images to generate (default: 5)')
    args = parser.parse_args()
    
    # Create input directory if it doesn't exist
    if not os.path.exists(args.input):
        os.makedirs(args.input)
        print(f"Created input directory: {args.input}")
    
    # Generate test images if requested
    if args.test:
        create_test_images(args.input, args.num_test_images)
    elif not os.listdir(args.input):
        print(f"Input directory '{args.input}' is empty.")
        print("You can use the --test option to generate test images.")
        print("Example: python images_to_pdf.py --test")
        return
    
    # Convert images to PDF
    images_to_pdf(args.input, args.output)

if __name__ == "__main__":
    main() 