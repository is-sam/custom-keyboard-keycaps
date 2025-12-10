import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Get a Lucide icon component by name
 */
export function getLucideIcon(name: string): LucideIcon | null {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const icon = icons[name];
  // Lucide icons are ForwardRef components (objects with $$typeof)
  if (icon && typeof icon === 'object' && '$$typeof' in icon) {
    return icon;
  }
  return null;
}

/**
 * Convert hardcoded colors in SVG to currentColor for dynamic coloring
 */
function convertSvgToCurrentColor(svgString: string): string {
  // Replace fill and stroke color values with currentColor
  // Matches hex colors (#fff, #ffffff), rgb/rgba, and named colors
  const colorPattern = /(fill|stroke)\s*=\s*["'](#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|[a-zA-Z]+)["']/gi;

  return svgString.replace(colorPattern, (match, attr, color) => {
    // Preserve 'none' and 'transparent' values
    const lowerColor = color.toLowerCase();
    if (lowerColor === 'none' || lowerColor === 'transparent') {
      return match;
    }
    return `${attr}="currentColor"`;
  });
}

/**
 * Validate and process an uploaded image file
 * Returns a data URL or null if invalid
 * For SVGs, converts hardcoded colors to currentColor for dynamic coloring
 */
export async function processUploadedImage(file: File): Promise<string | null> {
  const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    console.error('Invalid file type:', file.type);
    return null;
  }

  // Max file size: 1MB
  const maxSize = 1024 * 1024;
  if (file.size > maxSize) {
    console.error('File too large:', file.size);
    return null;
  }

  // For SVGs, read as text and convert colors to currentColor
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgString = e.target?.result as string;
        const convertedSvg = convertSvgToCurrentColor(svgString);
        // Convert back to data URL
        const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(convertedSvg)))}`;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsText(file);
    });
  }

  // For other image types, read as data URL directly
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}
