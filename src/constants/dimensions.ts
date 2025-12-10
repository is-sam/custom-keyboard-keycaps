// A4 page dimensions in mm
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// Default keycap dimensions in mm
export const DEFAULT_KEYCAP_WIDTH_MM = 12;  // 1.2 cm
export const DEFAULT_KEYCAP_HEIGHT_MM = 14; // 1.4 cm

// Default spacing and margins in mm
export const DEFAULT_SPACING_MM = 3;        // Space between keycaps for cutting
export const DEFAULT_MARGIN_MM = 5;         // Page margins
export const DEFAULT_CORNER_RADIUS_MM = 1;  // Rounded corners

// DPI constants
export const SCREEN_DPI = 96;
export const PRINT_DPI = 300;

// Conversion constants
export const MM_PER_INCH = 25.4;

// Utility functions for dimension conversion
export const mmToPx = (mm: number, dpi: number = SCREEN_DPI): number => {
  return mm * (dpi / MM_PER_INCH);
};

export const pxToMm = (px: number, dpi: number = SCREEN_DPI): number => {
  return px * (MM_PER_INCH / dpi);
};

// A4 dimensions in pixels at different DPIs
export const A4_WIDTH_PX_SCREEN = mmToPx(A4_WIDTH_MM, SCREEN_DPI);   // ~794px
export const A4_HEIGHT_PX_SCREEN = mmToPx(A4_HEIGHT_MM, SCREEN_DPI); // ~1123px
export const A4_WIDTH_PX_PRINT = mmToPx(A4_WIDTH_MM, PRINT_DPI);     // 2480px
export const A4_HEIGHT_PX_PRINT = mmToPx(A4_HEIGHT_MM, PRINT_DPI);   // 3508px
