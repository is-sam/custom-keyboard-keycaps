import { useState, useRef, useEffect } from 'react';
import { RgbaColorPicker } from 'react-colorful';
import type { RgbaColor } from 'react-colorful';
import { parseRgba, toRgba } from '../../utils/dimensions';

interface ColorPickerProps {
  label: string;
  value: string; // rgba() string
  onChange: (value: string) => void;
  showTransparent?: boolean;
}

const PRESET_COLORS = [
  'rgba(255, 255, 255, 1)', // White
  'rgba(0, 0, 0, 1)',       // Black
  'rgba(239, 68, 68, 1)',   // Red
  'rgba(249, 115, 22, 1)',  // Orange
  'rgba(234, 179, 8, 1)',   // Yellow
  'rgba(34, 197, 94, 1)',   // Green
  'rgba(59, 130, 246, 1)',  // Blue
  'rgba(168, 85, 247, 1)',  // Purple
  'rgba(236, 72, 153, 1)',  // Pink
  'rgba(107, 114, 128, 1)', // Gray
];

// Convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

// Parse hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  // Also handle 3-digit hex
  const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (shortResult) {
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16),
      g: parseInt(shortResult[2] + shortResult[2], 16),
      b: parseInt(shortResult[3] + shortResult[3], 16),
    };
  }
  return null;
};

export function ColorPicker({
  label,
  value,
  onChange,
  showTransparent = true,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDragging = useRef(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const parsed = parseRgba(value);
  const [color, setColor] = useState<RgbaColor>({
    r: parsed.r,
    g: parsed.g,
    b: parsed.b,
    a: parsed.a,
  });

  // Only sync from parent when NOT dragging
  useEffect(() => {
    if (!isDragging.current) {
      const parsed = parseRgba(value);
      setColor({ r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.a });
    }
  }, [value]);

  const handleChange = (newColor: RgbaColor) => {
    isDragging.current = true;
    setColor(newColor);
    onChange(toRgba(newColor.r, newColor.g, newColor.b, newColor.a));
    // Reset dragging flag after a short delay
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  const handlePresetClick = (presetColor: string) => {
    const parsed = parseRgba(presetColor);
    setColor({ r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.a });
    onChange(presetColor);
  };

  const handleTransparent = () => {
    const newColor = { ...color, a: 0 };
    setColor(newColor);
    onChange(toRgba(newColor.r, newColor.g, newColor.b, 0));
  };

  const handleHexChange = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const newColor = { ...rgb, a: color.a };
      setColor(newColor);
      onChange(toRgba(newColor.r, newColor.g, newColor.b, newColor.a));
    }
  };

  const handleAlphaChange = (alpha: number) => {
    const newColor = { ...color, a: alpha };
    setColor(newColor);
    onChange(toRgba(newColor.r, newColor.g, newColor.b, alpha));
  };

  const isTransparent = color.a === 0;
  const hexValue = rgbToHex(color.r, color.g, color.b);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-300">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-10 rounded-lg border border-neutral-700 overflow-hidden flex items-center"
        >
          <div className="w-full h-full checkerboard">
            <div
              className="w-full h-full"
              style={{ backgroundColor: value }}
            />
          </div>
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className="absolute z-50 top-12 left-0 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 p-3 space-y-3"
          >
            <RgbaColorPicker color={color} onChange={handleChange} />

            {/* Hex and Alpha inputs */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-neutral-500 block mb-1">Hex</label>
                <input
                  type="text"
                  value={hexValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-neutral-700 border border-neutral-600 rounded text-neutral-100 font-mono"
                  placeholder="#000000"
                />
              </div>
              <div className="w-16">
                <label className="text-xs text-neutral-500 block mb-1">Alpha</label>
                <input
                  type="number"
                  value={Math.round(color.a * 100)}
                  onChange={(e) => handleAlphaChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
                  min={0}
                  max={100}
                  className="w-full px-2 py-1 text-sm bg-neutral-700 border border-neutral-600 rounded text-neutral-100 text-center"
                />
              </div>
            </div>

            {/* Preset colors */}
            <div className="flex flex-wrap gap-1">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => handlePresetClick(presetColor)}
                  className="w-6 h-6 rounded border border-neutral-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>

            {/* Transparent button */}
            {showTransparent && (
              <button
                type="button"
                onClick={handleTransparent}
                className={`w-full py-1 px-2 text-sm rounded border ${
                  isTransparent
                    ? 'bg-blue-900/50 border-blue-500 text-blue-300'
                    : 'bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                Transparent
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-1 px-2 text-sm rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
