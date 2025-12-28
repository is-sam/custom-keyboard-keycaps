import type { PositionedKeycap, PageSettings } from '../types/keycap';
import { PRINT_DPI, MM_PER_INCH } from '../constants/dimensions';
import { parseRgba } from './dimensions';
import { getLucideIcon } from './iconUtils';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

/**
 * Export keycaps to PNG at print quality (300 DPI)
 */
export async function exportToPNG(
  layout: PositionedKeycap[],
  pageSettings: PageSettings,
  dpi: number = PRINT_DPI
): Promise<void> {
  // Calculate canvas size at the specified DPI
  const widthPx = Math.round((pageSettings.width / MM_PER_INCH) * dpi);
  const heightPx = Math.round((pageSettings.height / MM_PER_INCH) * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Scale factor to convert mm to pixels
  const scale = dpi / MM_PER_INCH;

  // Filter out overflow keycaps and placeholders (placeholders take space but don't print)
  const validKeycaps = layout.filter((k) => k.x >= 0 && k.y >= 0 && !k.isPlaceholder);

  for (const keycap of validKeycaps) {
    await drawKeycapToCanvas(ctx, keycap, pageSettings, scale);
  }

  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'keycaps.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
}

async function drawKeycapToCanvas(
  ctx: CanvasRenderingContext2D,
  keycap: PositionedKeycap,
  pageSettings: PageSettings,
  scale: number
): Promise<void> {
  const x = keycap.x * scale;
  const y = keycap.y * scale;
  const width = keycap.width * scale;
  const height = keycap.height * scale;
  const radius = pageSettings.cornerRadius * scale;

  // Draw background
  const bgColor = parseRgba(keycap.backgroundColor);
  if (bgColor.a > 0) {
    ctx.fillStyle = keycap.backgroundColor;
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.fill();
  }

  // Draw icon (only if not center text position, or no text)
  if (keycap.textPosition !== 'center' || !keycap.text) {
    if (keycap.icon.type === 'lucide' && keycap.icon.name) {
      await drawLucideIconToCanvas(ctx, keycap, scale);
    } else if (keycap.icon.type === 'custom' && keycap.icon.dataUrl) {
      await drawCustomIconToCanvas(ctx, keycap, scale);
    }
  }

  // Draw text
  if (keycap.text) {
    drawTextToCanvas(ctx, keycap, scale);
  }

  // Draw cut guides
  if (pageSettings.showCutGuides) {
    const guideOffset = 1 * scale; // 1mm outside
    ctx.strokeStyle = '#999999';
    ctx.setLineDash([4 * scale, 2 * scale]);
    ctx.lineWidth = 0.5 * scale;
    drawRoundedRect(
      ctx,
      x - guideOffset,
      y - guideOffset,
      width + guideOffset * 2,
      height + guideOffset * 2,
      radius + guideOffset
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Load an SVG string as an image, applying color replacement
 */
async function loadSvgAsImage(svgString: string, color?: string): Promise<HTMLImageElement> {
  // Replace currentColor with actual color if provided
  let processedSvg = svgString;
  if (color) {
    processedSvg = processedSvg.replace(/currentColor/gi, color);
  }

  const svgBlob = new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  URL.revokeObjectURL(url);
  return img;
}

async function drawLucideIconToCanvas(
  ctx: CanvasRenderingContext2D,
  keycap: PositionedKeycap,
  scale: number
): Promise<void> {
  if (!keycap.icon.name) return;

  const IconComponent = getLucideIcon(keycap.icon.name);
  if (!IconComponent) return;

  try {
    // Render icon to SVG string
    const iconSize = keycap.stretchIcon
      ? Math.min(keycap.width, keycap.height) * scale
      : Math.min(keycap.width, keycap.height) * 0.6 * scale;
    const svgString = renderToStaticMarkup(
      React.createElement(IconComponent, {
        size: iconSize,
        color: keycap.iconColor,
        strokeWidth: 2,
      })
    );

    // Load SVG as image
    const img = await loadSvgAsImage(svgString);

    // Calculate position
    const x = keycap.x * scale;
    const y = keycap.y * scale;
    const iconX = x + (keycap.width * scale - iconSize) / 2;

    let iconY: number;
    if (keycap.text && keycap.textPosition === 'below') {
      iconY = y + (keycap.height * scale * 0.35 - iconSize / 2);
    } else if (keycap.text && keycap.textPosition === 'above') {
      iconY = y + (keycap.height * scale * 0.65 - iconSize / 2);
    } else {
      iconY = y + (keycap.height * scale - iconSize) / 2;
    }

    ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
  } catch (e) {
    console.error('Failed to draw Lucide icon:', e);
  }
}

async function drawCustomIconToCanvas(
  ctx: CanvasRenderingContext2D,
  keycap: PositionedKeycap,
  scale: number
): Promise<void> {
  if (!keycap.icon.dataUrl) return;

  try {
    const iconSize = keycap.stretchIcon
      ? Math.min(keycap.width, keycap.height) * scale
      : Math.min(keycap.width, keycap.height) * 0.6 * scale;
    const x = keycap.x * scale;
    const y = keycap.y * scale;
    const iconX = x + (keycap.width * scale - iconSize) / 2;

    let iconY: number;
    if (keycap.text && keycap.textPosition === 'below') {
      iconY = y + (keycap.height * scale * 0.35 - iconSize / 2);
    } else if (keycap.text && keycap.textPosition === 'above') {
      iconY = y + (keycap.height * scale * 0.65 - iconSize / 2);
    } else {
      iconY = y + (keycap.height * scale - iconSize) / 2;
    }

    const isSvg = keycap.icon.dataUrl.includes('image/svg+xml');

    if (isSvg) {
      // Decode base64 SVG and apply color
      const base64 = keycap.icon.dataUrl.split(',')[1];
      const svgString = decodeURIComponent(escape(atob(base64)));

      // Load with color replacement
      const img = await loadSvgAsImage(svgString, keycap.iconColor);
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
    } else {
      // For PNG/JPEG, load directly
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = keycap.icon.dataUrl!;
      });

      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
    }
  } catch (e) {
    console.error('Failed to draw custom icon:', e);
  }
}

function drawTextToCanvas(
  ctx: CanvasRenderingContext2D,
  keycap: PositionedKeycap,
  scale: number
): void {
  if (!keycap.text) return;

  const fontSize = Math.min(keycap.width, keycap.height) * 0.15 * scale;
  ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = keycap.textColor || keycap.iconColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const x = keycap.x * scale;
  const y = keycap.y * scale;
  const textX = x + (keycap.width * scale) / 2;

  let textY: number;
  if (keycap.textPosition === 'above') {
    textY = y + keycap.height * scale * 0.25;
  } else if (keycap.textPosition === 'center') {
    textY = y + keycap.height * scale / 2;
  } else {
    textY = y + keycap.height * scale * 0.8;
  }

  ctx.fillText(keycap.text, textX, textY);
}
