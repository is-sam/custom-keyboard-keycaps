import type { Keycap, PageSettings, PositionedKeycap } from '../types/keycap';

interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * MAXRECTS bin-packing algorithm with Best Short Side Fit (BSSF)
 * Optimally arranges keycaps on an A4 page
 */
export function packKeycaps(
  keycaps: Keycap[],
  settings: PageSettings
): PositionedKeycap[] {
  if (keycaps.length === 0) return [];

  // Calculate usable area (page minus margins)
  const usableWidth = settings.width - settings.marginLeft - settings.marginRight;
  const usableHeight = settings.height - settings.marginTop - settings.marginBottom;

  // Sort keycaps by area (largest first) for better packing
  const sortedKeycaps = [...keycaps].sort(
    (a, b) => b.width * b.height - a.width * a.height
  );

  // Initialize free rectangles with the full usable area
  let freeRectangles: FreeRectangle[] = [
    { x: 0, y: 0, width: usableWidth, height: usableHeight },
  ];

  const placedKeycaps: PositionedKeycap[] = [];

  for (const keycap of sortedKeycaps) {
    // Add spacing to keycap dimensions for packing calculation
    const paddedWidth = keycap.width + settings.spacing;
    const paddedHeight = keycap.height + settings.spacing;

    // Find best position using Best Short Side Fit
    const bestFit = findBestPosition(freeRectangles, paddedWidth, paddedHeight);

    if (bestFit) {
      // Place keycap (without the spacing padding in the actual position)
      placedKeycaps.push({
        ...keycap,
        x: settings.marginLeft + bestFit.x + settings.spacing / 2,
        y: settings.marginTop + bestFit.y + settings.spacing / 2,
      });

      // Split free rectangles around the placed keycap
      freeRectangles = splitFreeRectangles(freeRectangles, bestFit, paddedWidth, paddedHeight);
    } else {
      // Couldn't fit - still add but mark it at position that indicates overflow
      // In a real scenario, this would trigger multi-page support
      placedKeycaps.push({
        ...keycap,
        x: -1, // Indicates overflow
        y: -1,
      });
    }
  }

  return placedKeycaps;
}

/**
 * Find the best position for a rectangle using Best Short Side Fit
 */
function findBestPosition(
  freeRectangles: FreeRectangle[],
  width: number,
  height: number
): { x: number; y: number; rotated: boolean } | null {
  let bestScore = Infinity;
  let bestPosition: { x: number; y: number; rotated: boolean } | null = null;

  for (const rect of freeRectangles) {
    // Try normal orientation
    if (width <= rect.width && height <= rect.height) {
      const shortSideFit = Math.min(rect.width - width, rect.height - height);
      if (shortSideFit < bestScore) {
        bestScore = shortSideFit;
        bestPosition = { x: rect.x, y: rect.y, rotated: false };
      }
    }
  }

  return bestPosition;
}

/**
 * Split free rectangles when a keycap is placed
 */
function splitFreeRectangles(
  freeRectangles: FreeRectangle[],
  position: { x: number; y: number },
  width: number,
  height: number
): FreeRectangle[] {
  const newFreeRectangles: FreeRectangle[] = [];

  for (const rect of freeRectangles) {
    // Check if the placed rectangle overlaps with this free rectangle
    if (
      position.x >= rect.x + rect.width ||
      position.x + width <= rect.x ||
      position.y >= rect.y + rect.height ||
      position.y + height <= rect.y
    ) {
      // No overlap, keep the free rectangle
      newFreeRectangles.push(rect);
      continue;
    }

    // Split into up to 4 new rectangles

    // Left piece
    if (position.x > rect.x) {
      newFreeRectangles.push({
        x: rect.x,
        y: rect.y,
        width: position.x - rect.x,
        height: rect.height,
      });
    }

    // Right piece
    if (position.x + width < rect.x + rect.width) {
      newFreeRectangles.push({
        x: position.x + width,
        y: rect.y,
        width: rect.x + rect.width - (position.x + width),
        height: rect.height,
      });
    }

    // Top piece
    if (position.y > rect.y) {
      newFreeRectangles.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: position.y - rect.y,
      });
    }

    // Bottom piece
    if (position.y + height < rect.y + rect.height) {
      newFreeRectangles.push({
        x: rect.x,
        y: position.y + height,
        width: rect.width,
        height: rect.y + rect.height - (position.y + height),
      });
    }
  }

  // Remove any rectangles that are fully contained within others
  return pruneContainedRectangles(newFreeRectangles);
}

/**
 * Remove rectangles that are fully contained within other rectangles
 */
function pruneContainedRectangles(rectangles: FreeRectangle[]): FreeRectangle[] {
  const result: FreeRectangle[] = [];

  for (let i = 0; i < rectangles.length; i++) {
    let isContained = false;

    for (let j = 0; j < rectangles.length; j++) {
      if (i === j) continue;

      const a = rectangles[i];
      const b = rectangles[j];

      // Check if a is contained within b
      if (
        a.x >= b.x &&
        a.y >= b.y &&
        a.x + a.width <= b.x + b.width &&
        a.y + a.height <= b.y + b.height
      ) {
        isContained = true;
        break;
      }
    }

    if (!isContained) {
      result.push(rectangles[i]);
    }
  }

  return result;
}
