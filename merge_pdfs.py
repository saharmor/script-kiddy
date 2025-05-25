#!/usr/bin/env python3
"""
PDF Merger Script

Usage:
    python merge_pdfs.py file1.pdf file2.pdf ... -o output.pdf

Merges multiple PDF files into a single PDF, handling different page sizes by centering each page on a blank page of the largest size encountered.
"""

import argparse
from PyPDF2 import PdfReader, PdfWriter, PageObject, Transformation
import sys
import copy


def get_max_page_size(pdf_paths):
    """Return the (width, height) of the largest page in all PDFs."""
    max_width, max_height = 0, 0
    for path in pdf_paths:
        reader = PdfReader(path)
        for page in reader.pages:
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            max_width = max(max_width, width)
            max_height = max(max_height, height)
    return max_width, max_height


def merge_pdfs(pdf_paths, output_path):
    max_width, max_height = get_max_page_size(pdf_paths)
    writer = PdfWriter()

    for path in pdf_paths:
        reader = PdfReader(path)
        for page in reader.pages:
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            # If page size matches, just add
            if width == max_width and height == max_height:
                writer.add_page(page)
            else:
                # Center the page on a blank page of max size
                new_page = PageObject.create_blank_page(width=max_width, height=max_height)
                # Calculate offsets to center
                x_offset = (max_width - width) / 2
                y_offset = (max_height - height) / 2
                # Create a copy of the page to avoid modifying the original
                page_copy = copy.deepcopy(page)
                # Use the new API for PyPDF2 3.0+, expand=True is crucial here
                page_copy.add_transformation(Transformation().translate(tx=x_offset, ty=y_offset), expand=True)
                new_page.merge_page(page_copy)
                writer.add_page(new_page)

    with open(output_path, "wb") as f:
        writer.write(f)
    print(f"Merged {len(pdf_paths)} PDFs into {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Merge multiple PDFs into one, handling different page sizes.")
    parser.add_argument("pdfs", nargs='+', help="Input PDF files to merge (in order)")
    parser.add_argument("-o", "--output", default="merged.pdf", help="Output PDF file name (default: merged.pdf)")
    args = parser.parse_args()

    if len(args.pdfs) < 2:
        print("Please provide at least two PDF files to merge.")
        sys.exit(1)

    merge_pdfs(args.pdfs, args.output)

if __name__ == "__main__":
    main() 