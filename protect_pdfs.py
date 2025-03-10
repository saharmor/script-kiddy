#!/usr/bin/env python3
"""
PDF Password Protection Script

This script iterates through a folder called 'img_to_pdf_input' and locks each PDF file
with a given password. The protected PDFs are saved to a new folder called 'protected_pdfs'.
"""

import os
import argparse
from pathlib import Path
from PyPDF2 import PdfReader, PdfWriter

def protect_pdf(input_path, output_path, password):
    """
    Apply password protection to a PDF file.
    
    Args:
        input_path (str): Path to the input PDF file
        output_path (str): Path where the protected PDF will be saved
        password (str): Password to encrypt the PDF with
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create a PDF reader object
        reader = PdfReader(input_path)
        
        # Create a PDF writer object
        writer = PdfWriter()
        
        # Add all pages from the reader to the writer
        for page in reader.pages:
            writer.add_page(page)
        
        # Encrypt the PDF with the provided password
        writer.encrypt(password)
        
        # Write the protected PDF to the output file
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        print(f"✅ Protected: {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
        return True
    
    except Exception as e:
        print(f"❌ Error protecting {input_path}: {str(e)}")
        return False

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Protect PDF files with a password")
    parser.add_argument("--password", "-p", required=True, help="Password to protect the PDFs")
    parser.add_argument("--input-dir", "-i", default="img_to_pdf_input", 
                        help="Input directory containing PDFs (default: img_to_pdf_input)")
    parser.add_argument("--output-dir", "-o", default="protected_pdfs", 
                        help="Output directory for protected PDFs (default: protected_pdfs)")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Create the input and output directories if they don't exist
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    
    if not input_dir.exists():
        print(f"Creating input directory: {input_dir}")
        input_dir.mkdir(parents=True, exist_ok=True)
    
    if not output_dir.exists():
        print(f"Creating output directory: {output_dir}")
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get all PDF files in the input directory
    pdf_files = [f for f in input_dir.glob("*.pdf")]
    
    if not pdf_files:
        print(f"No PDF files found in {input_dir}. Please add PDF files and try again.")
        return
    
    print(f"Found {len(pdf_files)} PDF files in {input_dir}")
    
    # Process each PDF file
    successful = 0
    for pdf_file in pdf_files:
        output_path = output_dir / f"protected_{pdf_file.name}"
        if protect_pdf(str(pdf_file), str(output_path), args.password):
            successful += 1
    
    # Print summary
    print(f"\nSummary: Protected {successful} out of {len(pdf_files)} PDF files")
    print(f"Protected PDFs saved to: {output_dir}")

if __name__ == "__main__":
    main()
