import jsPDF from 'jspdf';
import type { PositionedKeycap, PageSettings } from '../types/keycap';
import { parseRgba } from './dimensions';
import { getLucideIcon } from './iconUtils';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

/**
 * Export keycaps to PDF with precise mm dimensions
 * @param openInNewWindow - If true, opens PDF in new window instead of downloading
 */
export async function exportToPDF(
  layout: PositionedKeycap[],
  pageSettings: PageSettings,
  openInNewWindow = false
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Filter out overflow keycaps and placeholders (placeholders take space but don't print)
  const validKeycaps = layout.filter((k) => k.x >= 0 && k.y >= 0 && !k.isPlaceholder);

  for (const keycap of validKeycaps) {
    // Draw background
    const bgColor = parseRgba(keycap.backgroundColor);
    if (bgColor.a > 0) {
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      pdf.roundedRect(
        keycap.x,
        keycap.y,
        keycap.width,
        keycap.height,
        pageSettings.cornerRadius,
        pageSettings.cornerRadius,
        'F'
      );
    }

    // Draw icon (only if not center text position, or no text)
    if (keycap.textPosition !== 'center' || !keycap.text) {
      if (keycap.icon.type === 'lucide' && keycap.icon.name) {
        await drawLucideIconToPDF(pdf, keycap);
      } else if (keycap.icon.type === 'custom' && keycap.icon.dataUrl) {
        await drawCustomIconToPDF(pdf, keycap);
      }
    }

    // Draw text
    if (keycap.text) {
      drawTextToPDF(pdf, keycap);
    }

    // Draw cut guides
    if (pageSettings.showCutGuides) {
      const guideOffset = 1; // 1mm outside
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineDashPattern([2, 1], 0);
      pdf.roundedRect(
        keycap.x - guideOffset,
        keycap.y - guideOffset,
        keycap.width + guideOffset * 2,
        keycap.height + guideOffset * 2,
        pageSettings.cornerRadius + guideOffset,
        pageSettings.cornerRadius + guideOffset,
        'S'
      );
      pdf.setLineDashPattern([], 0);
    }
  }

  // Download or open in new window
  if (openInNewWindow) {
    // Open PDF in new window for printing
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        // Clean up the URL after the window is loaded
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      };
    }
  } else {
    pdf.save('keycaps.pdf');
  }
}

/**
 * Convert SVG string to a canvas-rendered PNG data URL
 */
async function svgToDataUrl(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    // Use higher resolution for better quality
    const scale = 4;
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}

async function drawLucideIconToPDF(
  pdf: jsPDF,
  keycap: PositionedKeycap
): Promise<void> {
  if (!keycap.icon.name) return;

  const IconComponent = getLucideIcon(keycap.icon.name);
  if (!IconComponent) return;

  try {
    // Calculate icon position and size
    const iconSizeMm = keycap.stretchIcon
      ? Math.min(keycap.width, keycap.height)
      : Math.min(keycap.width, keycap.height) * 0.6;
    const iconSizePx = iconSizeMm * 10; // Convert to pixels for rendering
    const iconX = keycap.x + (keycap.width - iconSizeMm) / 2;

    // Adjust Y position based on text position
    let iconY: number;
    if (keycap.text && keycap.textPosition === 'below') {
      iconY = keycap.y + (keycap.height * 0.35 - iconSizeMm / 2);
    } else if (keycap.text && keycap.textPosition === 'above') {
      iconY = keycap.y + (keycap.height * 0.65 - iconSizeMm / 2);
    } else {
      iconY = keycap.y + (keycap.height - iconSizeMm) / 2;
    }

    // Render Lucide icon to SVG string
    const svgString = renderToStaticMarkup(
      React.createElement(IconComponent, {
        size: iconSizePx,
        color: keycap.iconColor,
        strokeWidth: 2,
      })
    );

    // Convert SVG to PNG data URL
    const dataUrl = await svgToDataUrl(svgString, iconSizePx, iconSizePx);

    // Add to PDF
    pdf.addImage(dataUrl, 'PNG', iconX, iconY, iconSizeMm, iconSizeMm);
  } catch (e) {
    console.error('Failed to draw Lucide icon to PDF:', e);
  }
}

async function drawCustomIconToPDF(
  pdf: jsPDF,
  keycap: PositionedKeycap
): Promise<void> {
  if (!keycap.icon.dataUrl) return;

  try {
    const iconSizeMm = keycap.stretchIcon
      ? Math.min(keycap.width, keycap.height)
      : Math.min(keycap.width, keycap.height) * 0.6;
    const iconX = keycap.x + (keycap.width - iconSizeMm) / 2;

    let iconY: number;
    if (keycap.text && keycap.textPosition === 'below') {
      iconY = keycap.y + (keycap.height * 0.35 - iconSizeMm / 2);
    } else if (keycap.text && keycap.textPosition === 'above') {
      iconY = keycap.y + (keycap.height * 0.65 - iconSizeMm / 2);
    } else {
      iconY = keycap.y + (keycap.height - iconSizeMm) / 2;
    }

    const isSvg = keycap.icon.dataUrl.includes('image/svg+xml');

    if (isSvg) {
      // Decode base64 SVG and apply color
      const base64 = keycap.icon.dataUrl.split(',')[1];
      let svgString = decodeURIComponent(escape(atob(base64)));

      // Replace currentColor with actual color
      svgString = svgString.replace(/currentColor/gi, keycap.iconColor);

      // Convert to PNG
      const iconSizePx = iconSizeMm * 10;
      const dataUrl = await svgToDataUrl(svgString, iconSizePx, iconSizePx);

      pdf.addImage(dataUrl, 'PNG', iconX, iconY, iconSizeMm, iconSizeMm);
    } else {
      // For PNG/JPEG, use directly
      const format = keycap.icon.dataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      pdf.addImage(keycap.icon.dataUrl, format, iconX, iconY, iconSizeMm, iconSizeMm);
    }
  } catch (e) {
    console.error('Failed to add custom icon to PDF:', e);
  }
}

function drawTextToPDF(pdf: jsPDF, keycap: PositionedKeycap): void {
  if (!keycap.text) return;

  const textColor = parseRgba(keycap.textColor || keycap.iconColor);
  pdf.setTextColor(textColor.r, textColor.g, textColor.b);

  const fontSize = Math.min(keycap.width, keycap.height) * 0.15;
  pdf.setFontSize(fontSize * 2.83465); // Convert mm to pt (1mm ≈ 2.83pt)

  const textX = keycap.x + keycap.width / 2;
  let textY: number;

  if (keycap.textPosition === 'above') {
    textY = keycap.y + keycap.height * 0.25;
  } else if (keycap.textPosition === 'center') {
    textY = keycap.y + keycap.height / 2;
  } else {
    textY = keycap.y + keycap.height * 0.8;
  }

  pdf.text(keycap.text, textX, textY, { align: 'center' });
}
