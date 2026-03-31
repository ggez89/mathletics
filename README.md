# Mathletics - Worksheet Generation

[View App](https://ggez89.github.io/mathletics/)

A professional, highly customizable math worksheet generator designed for educators and parents. Create high-quality, printable math practice sheets in seconds with precise control over problem types, difficulty levels, and layout.

## Features

- **Multiple Problem Modules**:
  - **Basic Arithmetic**: Addition, Subtraction, Multiplication (×), and Division (÷).
  - **Long Division**: Customizable dividend and divisor ranges with remainder toggles.
  - **Fractions**: Addition, Subtraction, Multiplication, and Division with optional unreduced answer forms and "Like Denominators" mode.
  - **Time Telling**: Analog clock practice with **Identify** (read the clock) and **Draw** (draw the hands) modes. Includes "Scenarios" (e.g., "I wake up at...") for real-world context.
- **Advanced Customization**:
  - **Value Ranges**: Set minimum and maximum values for operands, numerators, and denominators.
  - **Max Answer**: Enforce "Max Answer" limits across all operations.
  - **Division Remainders**: Toggle "Allow Remainders" for division with standard "Quotient R Remainder" notation.
  - **Quotient Validation**: "Disallow Quotient 1" option to ensure meaningful practice.
  - **Clock Customization**: Toggle minute ticks and choose between "All Numbers" or "Major Numbers" (12, 3, 6, 9) on clock faces.
- **Professional Layout & Pagination**:
  - **Strict 8.5" x 11" Rendering**: Worksheets are rendered in a fixed-height container to ensure perfect print alignment.
  - **Smart Pagination**: Automatically calculates how many problems fit per page based on problem type and font size.
  - **Page Numbering**: Includes "Page X of Y" in the footer for multi-page worksheets.
  - **Smart Header**: Titles automatically shrink their font size to stay on a single line, ensuring a consistent header layout.
- **Modern Web Features**:
  - **Mobile Optimized**: "Shrink-to-fit" responsive scaling ensures worksheets are perfectly visible on any device.
  - **Base64 Config Sharing**: Encode your entire worksheet configuration into a URL-safe key for easy sharing and reproducibility.
  - **Seed-Based Generation**: Every worksheet includes a unique "Seed" for predictable random generation.
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
