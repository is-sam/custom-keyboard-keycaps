# Custom Keyboard Keycaps Designer

A web application for designing custom keyboard keycaps that can be printed on sticker paper. Create keycaps with icons, colors, and text labels, then export to PDF or PNG for printing.

![Keycap Designer](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue) ![Vite](https://img.shields.io/badge/Vite-7.2-purple)

## Features

### Design Tools
- **Visual Editor**: Create and customize keycaps with a real-time preview
- **Icon Library**: Choose from hundreds of Lucide icons or upload custom SVG/PNG/JPG images
- **Color Customization**: RGBA color picker for backgrounds, icons, and text
- **Text Labels**: Add custom text with configurable position (above, below, or center)
- **Placeholder/Spacers**: Add invisible spacers for layout control

### Layout & Organization
- **Automatic Layout**: Smart bin-packing algorithm optimizes keycap arrangement on A4 pages
- **Drag-and-Drop Reordering**: Rearrange keycaps by dragging them in the list
- **Page Settings**: Customize margins, spacing, and corner radius
- **Cut Guides**: Optional dashed guides for precise cutting

### Export & Print
- **Print Directly**: Open PDF in browser for immediate printing
- **PDF Export**: Download vector PDF files (crisp at any size)
- **PNG Export**: High-resolution images with configurable DPI (72-600)
- **JSON Configuration**: Save and restore entire designs for later use

### User Interface
- **Dark Theme**: Easy-on-the-eyes dark interface
- **Quick Actions**: Keyboard shortcuts for common operations
- **Delete Buttons**: One-click removal of keycaps
- **Auto-Save**: Designs persist automatically in browser storage

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **Zustand** - Lightweight state management with persistence
- **jsPDF** - PDF generation
- **Lucide React** - Icon library (1000+ icons)
- **react-colorful** - RGBA color picker
- **react-dropzone** - File upload handling

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd custom-keyboard-keycaps
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Development Commands

```bash
npm run dev      # Start development server with HMR
npm run build    # TypeScript check + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Usage Guide

### Creating Keycaps

1. **Add a Keycap**: Click the "Add Keycap" button in the Keycaps tab
   - Use the dropdown arrow to choose between Normal or Placeholder

2. **Customize**: Select a keycap to open the editor
   - Adjust width and height (5-50mm)
   - Choose an icon from the library or upload your own
   - Set background, icon, and text colors
   - Add optional text labels

3. **Reorder**: Drag keycaps in the list to change their order

4. **Delete**: Click the X button on any keycap to remove it

### Keyboard Shortcuts

- `Ctrl/Cmd + A` - Add new keycap
- `Delete/Backspace` - Delete selected keycap
- `Ctrl/Cmd + D` - Duplicate selected keycap

### Adjusting Page Settings

1. Go to the **Settings** tab
2. Configure:
   - Page margins (top, right, bottom, left)
   - Spacing between keycaps
   - Corner radius for rounded edges
   - Default colors for new keycaps
   - Toggle cut guides on/off

### Printing & Exporting

1. Go to the **Print** tab to see export status
2. Options:
   - **Print**: Opens PDF directly in browser for immediate printing
   - **Export PDF**: Download PDF file for later use
   - **Export PNG**: Download high-res PNG (adjust DPI as needed)

### Saving & Loading Designs

**Export Configuration**:
- Click "Export Configuration" in the Print tab
- Saves a JSON file with all keycaps and settings

**Import Configuration**:
- Click "Import Configuration"
- Select a previously exported JSON file
- Entire design is restored instantly

## Project Structure

```
src/
├── components/
│   ├── icons/          # Icon picker and uploader
│   ├── keycap/         # Keycap components (list, editor, preview)
│   ├── layout/         # App layout (header, sidebar, canvas)
│   ├── settings/       # Settings and export panels
│   └── ui/             # Reusable UI components
├── store/
│   └── keycapStore.ts  # Zustand state management
├── types/
│   └── keycap.ts       # TypeScript type definitions
├── utils/
│   ├── binPacking.ts   # Layout algorithm (MAXRECTS-BSSF)
│   ├── pdfExport.ts    # PDF generation
│   ├── imageExport.ts  # PNG generation
│   ├── iconUtils.ts    # Icon handling
│   └── dimensions.ts   # Unit conversions (mm/px/DPI)
└── constants/
    └── dimensions.ts   # Default measurements
```

## Key Concepts

### Dimensions
All measurements are stored in millimeters for print accuracy:
- **Screen Display**: 96 DPI
- **Print Export**: 300 DPI (default)
- **Page Size**: A4 (210mm × 297mm)

### Icon Types
- **Lucide Icons**: Built-in vector icons (customizable color)
- **Custom SVG**: Uploaded SVG files (color can be changed)
- **Custom PNG/JPG**: Uploaded raster images (color cannot be changed)

### Placeholders
Placeholders are invisible spacers that:
- Take up space in the layout
- Help with keycap positioning
- Don't appear in printed output
- Can be converted to/from normal keycaps

### Layout Algorithm
Uses MAXRECTS-BSSF bin-packing to:
- Maximize keycaps per page
- Minimize wasted space
- Handle different keycap sizes
- Identify overflow keycaps (shown separately)

## Browser Support

Works best in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Tips for Best Results

1. **Print Settings**: Use 300 DPI for crisp output
2. **Paper**: Glossy sticker paper works best
3. **Colors**: Light backgrounds with dark text/icons are easiest to read
4. **Size**: Standard keycap size is 12-18mm
5. **Margins**: Leave at least 5mm margins for easier cutting

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Icons provided by [Lucide](https://lucide.dev/)
- Bin-packing algorithm based on MAXRECTS-BSSF
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
