export interface IconConfig {
  type: 'lucide' | 'custom' | 'none';
  name?: string;      // Lucide icon name
  dataUrl?: string;   // Custom uploaded icon as base64 data URL
}

export interface Keycap {
  id: string;
  width: number;           // mm
  height: number;          // mm
  icon: IconConfig;
  iconColor: string;       // rgba() format
  backgroundColor: string; // rgba() format
  text?: string;           // Optional text label
  textColor?: string;      // Text color rgba()
  textPosition?: 'below' | 'above' | 'center';
  isPlaceholder?: boolean; // If true, this keycap is just a spacer (won't print)
}

export interface PositionedKeycap extends Keycap {
  x: number;  // mm from left
  y: number;  // mm from top
}

export interface PageSettings {
  width: number;           // mm (default 210 for A4)
  height: number;          // mm (default 297 for A4)
  marginTop: number;       // mm
  marginRight: number;     // mm
  marginBottom: number;    // mm
  marginLeft: number;      // mm
  spacing: number;         // mm between keycaps
  cornerRadius: number;    // mm - applies to ALL keycaps
  showCutGuides: boolean;  // Show dashed lines around keycaps
  defaultIconColor: string;       // Default icon color for new keycaps
  defaultBackgroundColor: string; // Default background color for new keycaps
  defaultKeycapWidth: number;     // Default width for new keycaps (mm)
  defaultKeycapHeight: number;    // Default height for new keycaps (mm)
}

export interface ExportSettings {
  format: 'pdf' | 'png';
  dpi: number;             // For raster export (default 300)
}
