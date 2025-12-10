import { useRef, useState, useEffect } from 'react';
import { useKeycapStore } from '../../store/keycapStore';
import { Keycap } from '../keycap/Keycap';
import { mmToScreenPx } from '../../utils/dimensions';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export function Canvas() {
  const { layout, pageSettings, selectedKeycapId, selectKeycap } = useKeycapStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [autoZoom, setAutoZoom] = useState(true);

  // Page dimensions in pixels
  const pageWidthPx = mmToScreenPx(pageSettings.width);
  const pageHeightPx = mmToScreenPx(pageSettings.height);

  // Calculate auto-zoom to fit container
  useEffect(() => {
    if (autoZoom && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 48; // padding
      const containerHeight = container.clientHeight - 48;

      const scaleX = containerWidth / pageWidthPx;
      const scaleY = containerHeight / pageHeightPx;
      const fitZoom = Math.min(scaleX, scaleY, 1);

      setZoom(fitZoom);
    }
  }, [autoZoom, pageWidthPx, pageHeightPx]);

  const handleZoomIn = () => {
    setAutoZoom(false);
    setZoom((z) => Math.min(z * 1.25, 2));
  };

  const handleZoomOut = () => {
    setAutoZoom(false);
    setZoom((z) => Math.max(z / 1.25, 0.25));
  };

  const handleFitToScreen = () => {
    setAutoZoom(true);
  };

  // Render cut guides
  const renderCutGuides = (x: number, y: number, width: number, height: number) => {
    if (!pageSettings.showCutGuides) return null;

    const cornerRadius = mmToScreenPx(pageSettings.cornerRadius);
    const guideOffset = mmToScreenPx(1); // 1mm outside the keycap

    return (
      <rect
        x={x - guideOffset}
        y={y - guideOffset}
        width={width + guideOffset * 2}
        height={height + guideOffset * 2}
        rx={cornerRadius + guideOffset}
        ry={cornerRadius + guideOffset}
        fill="none"
        stroke="#666"
        strokeWidth="0.5"
        strokeDasharray="4,2"
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
      {/* Zoom controls */}
      <div className="flex items-center justify-between p-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-sm text-neutral-400 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-1 hover:bg-neutral-800 rounded ml-2 text-neutral-300"
            title="Fit to screen"
          >
            <Maximize size={20} />
          </button>
        </div>
        <div className="text-sm text-neutral-500">
          A4 ({pageSettings.width} × {pageSettings.height} mm)
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex items-start justify-center"
      >
        <div
          className="bg-white shadow-2xl relative"
          style={{
            width: `${pageWidthPx * zoom}px`,
            height: `${pageHeightPx * zoom}px`,
            minWidth: `${pageWidthPx * zoom}px`,
            minHeight: `${pageHeightPx * zoom}px`,
          }}
        >
          {/* Cut guides layer (SVG) */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={pageWidthPx * zoom}
            height={pageHeightPx * zoom}
            viewBox={`0 0 ${pageWidthPx} ${pageHeightPx}`}
          >
            {layout.map((keycap) => {
              if (keycap.x < 0 || keycap.y < 0) return null; // Skip overflow items
              const x = mmToScreenPx(keycap.x);
              const y = mmToScreenPx(keycap.y);
              const width = mmToScreenPx(keycap.width);
              const height = mmToScreenPx(keycap.height);

              return (
                <g key={`guide-${keycap.id}`}>
                  {renderCutGuides(x, y, width, height)}
                </g>
              );
            })}
          </svg>

          {/* Keycaps layer */}
          {layout.map((keycap) => {
            if (keycap.x < 0 || keycap.y < 0) return null; // Skip overflow items

            return (
              <div
                key={keycap.id}
                className="absolute"
                style={{
                  left: `${mmToScreenPx(keycap.x) * zoom}px`,
                  top: `${mmToScreenPx(keycap.y) * zoom}px`,
                }}
              >
                <Keycap
                  keycap={keycap}
                  cornerRadius={pageSettings.cornerRadius}
                  scale={zoom}
                  onClick={() => selectKeycap(keycap.id)}
                  isSelected={selectedKeycapId === keycap.id}
                />
              </div>
            );
          })}

          {/* Empty state */}
          {layout.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No keycaps added yet</p>
                <p className="text-sm">Add keycaps from the sidebar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
