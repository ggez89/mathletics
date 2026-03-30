# Mathletics - Worksheet Generation

[View App](https://ggez89.github.io/mathletics/)

A professional, highly customizable math worksheet generator designed for educators and parents. Create high-quality, printable math practice sheets in seconds with precise control over problem types, difficulty levels, and layout.

## Features

- **Multiple Problem Modules**:
  - **Basic Arithmetic**: Addition, Subtraction, Multiplication (×), and Division (÷).
  - **Long Division**: Customizable dividend and divisor ranges with remainder toggles.
  - **Fractions**: Addition, Subtraction, Multiplication, and Division with optional unreduced answer forms and "Like Denominators" mode.
- **Advanced Customization**:
  - Set minimum and maximum values for operands.
  - Enforce "Max Answer" limits across all operations.
  - Toggle "Allow Remainders" for division with proper `Quotient R Remainder` formatting.
  - "Disallow Quotient 1" option to ensure meaningful practice.
- **Professional Layout**:
  - Choose between **Inline**, **Vertical**, **Fraction**, and **Long Division** problem formats.
  - Adjust font size, spacing, and problems per row.
  - Automatic descriptive title generation (e.g., "Fraction Addition," "Long Division Practice").
- **Modern Web Features**:
  - **Mobile Optimized**: "Shrink-to-fit" responsive scaling ensures worksheets are perfectly visible on any device.
  - **Base64 Config Sharing**: Encode your entire worksheet configuration into a URL-safe key for easy sharing and reproducibility.
  - **Presets**: Save and load your favorite configurations directly to/from your browser's local storage.
- **Print & Save**:
  - **Print Ready**: Optimized CSS for clean, professional printing on standard 8.5" x 11" paper.
  - **Save as PDF**: Use the "Print Worksheet" button to save directly to your device as a PDF via your browser's print dialog.
  - **Answer Key**: Toggleable answer key for quick grading.

## Getting Started

1. Select a problem type from the sidebar.
2. Adjust the parameters (ranges, operations, layout) to fit your needs.
3. Preview the worksheet in real-time on the right.
4. Click **Print Worksheet** to send to your printer or select "Save as PDF" in the print destination.

## Tech Stack

- **React**: Modern functional components and hooks.
- **Tailwind CSS**: Utility-first styling for a clean, responsive interface.
- **Lucide React**: Beautiful, consistent iconography.
- **UUID**: Unique identification for problem tracking.
- **Seedrandom**: Predictable random number generation.

---
*Made with love for my family by Patrick Young.*
