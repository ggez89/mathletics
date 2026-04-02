# Mathletics - Worksheet Generation

[View App](https://ggez89.github.io/mathletics/)

A professional, highly customizable math worksheet generator designed for educators and parents. Create high-quality, printable math practice sheets in seconds with precise control over problem types, difficulty levels, and layout.

## Features

- **Multiple Problem Modules**:
  - **Basic Arithmetic**: Addition, Subtraction, Multiplication (×), and Division (÷).
  - **Long Division**: Customizable dividend and divisor ranges with remainder toggles. Includes **full step-by-step visual solutions** showing subtractions, bring-down arrows, and intermediate steps for easy grading and learning.
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
- **QR Code Answer Lookup**:
  - **Scan for Answers**: Optionally print a unique QR code in the worksheet footer.
  - **Instant Solutions**: Scanning the QR code opens the worksheet on any device with the answer key automatically enabled and the sidebar hidden for a clean "Solutions View".
  - **Configuration Persistence**: The QR code encodes the entire worksheet setup, ensuring the scanned version exactly matches the printed one.
- **Modern Web Features**:
  - **Help Tooltips**: Brief help descriptions for all features and settings, accessible via hover on desktop and click on mobile.
  - **Mobile Optimized**: "Shrink-to-fit" responsive scaling ensures worksheets are perfectly visible on any device.
  - **Base64 Config Sharing**: Encode your entire worksheet configuration into a URL-safe key for easy sharing and reproducibility.
  - **Seed-Based Generation**: Every worksheet includes a unique "Seed" for predictable random generation.
  - **Presets**: Save and load your favorite configurations directly to/from your browser's local storage.
- **Print & Save**:
  - **Print Ready**: Optimized CSS for clean, professional printing on standard 8.5" x 11" paper.
  - **Save as PDF**: Use the "Print Worksheet" button to save directly to your device as a PDF via your browser's print dialog.
  - **Answer Key**: Toggleable answer key for quick grading.

## Getting Started

0. **[Open the Web App](https://ggez89.github.io/mathletics/)**.
1. **Adjust Page Settings**: Set your worksheet title, font size, and layout preferences.
2. **Select Problem Type**: Choose a module from the sidebar (Arithmetic, Long Division, Fractions, or Time Telling).
3. **Adjust Parameters**: Fine-tune ranges, operations, and specific problem settings.
4. **Enable QR Code**: (Optional) Toggle "Show Answer QR Code" in Advanced Controls to include a digital answer key on your printout.
5. **Print Worksheet**: Click **Print Worksheet** to send to your printer or select "Save as PDF" in the print destination.

## Tech Stack

- **[React](https://react.dev/)**: Modern functional components and hooks.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling for a clean, responsive interface.
- **[Lucide React](https://lucide.dev/)**: Beautiful, consistent iconography.
- **[qrcode.react](https://www.npmjs.com/package/qrcode.react)**: High-quality QR code generation for digital answer keys.
- **[UUID](https://www.npmjs.com/package/uuid)**: Unique identification for problem tracking.
- **[Seedrandom](https://www.npmjs.com/package/seedrandom)**: Predictable random number generation.
- **[Google AI Studio](https://aistudio.google.com/)**: Used to build, iterate, and deploy this application through natural language prompting.

---
*Made with love for my family by Patrick Young.*
