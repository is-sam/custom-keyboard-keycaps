import { SCREEN_DPI, PRINT_DPI, MM_PER_INCH } from '../constants/dimensions';

/**
 * Convert millimeters to pixels at a given DPI
 */
export const mmToPx = (mm: number, dpi: number = SCREEN_DPI): number => {
  return mm * (dpi / MM_PER_INCH);
};

/**
 * Convert pixels to millimeters at a given DPI
 */
export const pxToMm = (px: number, dpi: number = SCREEN_DPI): number => {
  return px * (MM_PER_INCH / dpi);
};

/**
 * Convert mm to screen pixels (96 DPI)
 */
export const mmToScreenPx = (mm: number): number => mmToPx(mm, SCREEN_DPI);

/**
 * Convert mm to print pixels (300 DPI)
 */
export const mmToPrintPx = (mm: number): number => mmToPx(mm, PRINT_DPI);

/**
 * Parse RGBA color string to components
 */
export const parseRgba = (rgba: string): { r: number; g: number; b: number; a: number } => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
};

/**
 * Convert RGBA components to string
 */
export const toRgba = (r: number, g: number, b: number, a: number = 1): string => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Check if a color is transparent (alpha < 1)
 */
export const isTransparent = (rgba: string): boolean => {
  const { a } = parseRgba(rgba);
  return a < 1;
};

/**
 * Convert RGBA to hex (for contexts that don't support alpha)
 */
export const rgbaToHex = (rgba: string): string => {
  const { r, g, b } = parseRgba(rgba);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
