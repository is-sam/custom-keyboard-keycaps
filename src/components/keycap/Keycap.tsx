import type { Keycap as KeycapType } from '../../types/keycap';
import { mmToScreenPx, parseRgba } from '../../utils/dimensions';
import { getLucideIcon } from '../../utils/iconUtils';

interface KeycapProps {
  keycap: KeycapType;
  cornerRadius: number; // From page settings
  scale?: number; // For preview scaling
  onClick?: () => void;
  isSelected?: boolean;
}

export function Keycap({
  keycap,
  cornerRadius,
  scale = 1,
  onClick,
  isSelected = false,
}: KeycapProps) {
  const widthPx = mmToScreenPx(keycap.width) * scale;
  const heightPx = mmToScreenPx(keycap.height) * scale;
  const radiusPx = mmToScreenPx(cornerRadius) * scale;

  const bgParsed = parseRgba(keycap.backgroundColor);
  const isTransparent = bgParsed.a < 1;

  // Calculate icon size (60% of smaller dimension, or full size if stretched)
  const iconSize = keycap.stretchIcon
    ? Math.min(widthPx, heightPx)
    : Math.min(widthPx, heightPx) * 0.6;

  // Render icon
  const renderIcon = () => {
    if (keycap.icon.type === 'none') return null;

    if (keycap.icon.type === 'lucide' && keycap.icon.name) {
      const IconComponent = getLucideIcon(keycap.icon.name);
      if (IconComponent) {
        return (
          <IconComponent
            size={iconSize}
            color={keycap.iconColor}
            strokeWidth={2}
          />
        );
      }
    }

    if (keycap.icon.type === 'custom' && keycap.icon.dataUrl) {
      const isSvg = keycap.icon.dataUrl.includes('image/svg+xml');

      // For SVGs, render inline so currentColor works with the color property
      if (isSvg) {
        // Decode base64 SVG to get the actual SVG markup
        try {
          const base64 = keycap.icon.dataUrl.split(',')[1];
          const svgString = decodeURIComponent(escape(atob(base64)));

          return (
            <div
              style={{
                width: iconSize,
                height: iconSize,
                color: keycap.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              dangerouslySetInnerHTML={{
                __html: svgString.replace(/<svg/, `<svg style="width:100%;height:100%"`)
              }}
            />
          );
        } catch {
          // Fallback to img if decoding fails
          return (
            <img
              src={keycap.icon.dataUrl}
              alt="Custom icon"
              style={{
                width: iconSize,
                height: iconSize,
                objectFit: 'contain',
              }}
            />
          );
        }
      }

      return (
        <img
          src={keycap.icon.dataUrl}
          alt="Custom icon"
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
          }}
        />
      );
    }

    return null;
  };

  // Render text
  const renderText = () => {
    if (!keycap.text) return null;

    const fontSize = Math.min(widthPx, heightPx) * 0.2;

    return (
      <span
        style={{
          fontSize: `${fontSize}px`,
          color: keycap.textColor || keycap.iconColor,
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: '90%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {keycap.text}
      </span>
    );
  };

  // Determine flex direction based on text position
  const getFlexDirection = () => {
    if (!keycap.text || keycap.icon.type === 'none') return 'column';
    switch (keycap.textPosition) {
      case 'above':
        return 'column-reverse';
      case 'center':
        return 'column'; // Text replaces icon in center mode
      default:
        return 'column';
    }
  };

  // Placeholder styling
  if (keycap.isPlaceholder) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center cursor-pointer transition-shadow ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          borderRadius: `${radiusPx}px`,
          border: '2px dashed rgba(150, 150, 150, 0.5)',
          backgroundColor: 'rgba(100, 100, 100, 0.1)',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: `${Math.min(widthPx, heightPx) * 0.15}px`, color: 'rgba(150, 150, 150, 0.6)' }}>
          skip
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center cursor-pointer transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isTransparent ? 'checkerboard' : ''}`}
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        borderRadius: `${radiusPx}px`,
        backgroundColor: keycap.backgroundColor,
        flexDirection: getFlexDirection(),
        gap: `${heightPx * 0.05}px`,
        padding: `${heightPx * 0.05}px`,
        boxSizing: 'border-box',
      }}
    >
      {keycap.textPosition !== 'center' && renderIcon()}
      {renderText()}
      {keycap.textPosition === 'center' && !keycap.text && renderIcon()}
    </div>
  );
}
