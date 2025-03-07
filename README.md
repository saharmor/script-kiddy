# Images to PDF Converter

This script combines images from a directory into a single PDF file, using the image filenames as page numbers.

## Requirements

Install the required Python packages:

```bash
pip install pillow reportlab numpy
```

## Usage

1. Place your images in the `./input` directory (will be created if it doesn't exist)
2. Name your images with numbers corresponding to the page order (e.g., `0.jpg`, `1.jpg`, `2.jpg`, etc.)
3. Run the script:

```bash
python images_to_pdf.py
```

By default, this will:
- Look for images in the `./input` directory
- Create a PDF file named `output.pdf`

## Command Line Options

You can customize the input directory and output filename:

```bash
python images_to_pdf.py --input ./my_images --output my_document.pdf
```

Or using the short form:

```bash
python images_to_pdf.py -i ./my_images -o my_document.pdf
```

### Generate Test Images

The script can generate test images for demonstration:

```bash
python images_to_pdf.py --test
```

You can specify the number of test images to generate:

```bash
python images_to_pdf.py --test --num-test-images 10
```

## Supported Image Formats

The script supports the following image formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- BMP (.bmp)
- TIFF (.tiff)

## How It Works

1. The script scans the input directory for image files
2. It extracts page numbers from filenames (e.g., `1.jpg` → page 1)
3. Images are sorted by page number
4. Each image is added to the PDF, scaled to fit the page while maintaining aspect ratio
5. The final PDF is saved to the specified output file
