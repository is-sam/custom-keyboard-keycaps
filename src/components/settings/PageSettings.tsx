import { useKeycapStore } from '../../store/keycapStore';
import { NumberInput } from '../ui/NumberInput';
import { ColorPicker } from '../ui/ColorPicker';

export function PageSettings() {
  const { pageSettings, updatePageSettings } = useKeycapStore();

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3">Page Margins</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Top"
            value={pageSettings.marginTop}
            onChange={(marginTop) => updatePageSettings({ marginTop })}
            min={0}
            max={50}
            step={1}
          />
          <NumberInput
            label="Bottom"
            value={pageSettings.marginBottom}
            onChange={(marginBottom) => updatePageSettings({ marginBottom })}
            min={0}
            max={50}
            step={1}
          />
          <NumberInput
            label="Left"
            value={pageSettings.marginLeft}
            onChange={(marginLeft) => updatePageSettings({ marginLeft })}
            min={0}
            max={50}
            step={1}
          />
          <NumberInput
            label="Right"
            value={pageSettings.marginRight}
            onChange={(marginRight) => updatePageSettings({ marginRight })}
            min={0}
            max={50}
            step={1}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3">Spacing & Style</h3>
        <div className="space-y-3">
          <NumberInput
            label="Spacing Between Keycaps"
            value={pageSettings.spacing}
            onChange={(spacing) => updatePageSettings({ spacing })}
            min={1}
            max={20}
            step={0.5}
          />
          <NumberInput
            label="Corner Radius"
            value={pageSettings.cornerRadius}
            onChange={(cornerRadius) => updatePageSettings({ cornerRadius })}
            min={0}
            max={10}
            step={0.5}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3">Cut Guides</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pageSettings.showCutGuides}
            onChange={(e) => updatePageSettings({ showCutGuides: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-neutral-800 border-neutral-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-neutral-300">
            Show dashed cut guides around keycaps
          </span>
        </label>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3">Default Keycap Size</h3>
        <p className="text-xs text-neutral-500 mb-3">
          Applied to newly created keycaps
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Width (mm)"
            value={pageSettings.defaultKeycapWidth || 12}
            onChange={(defaultKeycapWidth) => updatePageSettings({ defaultKeycapWidth })}
            min={1}
            max={pageSettings.width}
            step={0.5}
          />
          <NumberInput
            label="Height (mm)"
            value={pageSettings.defaultKeycapHeight || 14}
            onChange={(defaultKeycapHeight) => updatePageSettings({ defaultKeycapHeight })}
            min={1}
            max={pageSettings.height}
            step={0.5}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3">Default Colors</h3>
        <p className="text-xs text-neutral-500 mb-3">
          Applied to newly created keycaps
        </p>
        <div className="space-y-3">
          <ColorPicker
            label="Default Background"
            value={pageSettings.defaultBackgroundColor || 'rgba(255, 255, 255, 1)'}
            onChange={(defaultBackgroundColor) => updatePageSettings({ defaultBackgroundColor })}
            showTransparent
          />
          <ColorPicker
            label="Default Icon Color"
            value={pageSettings.defaultIconColor || 'rgba(0, 0, 0, 1)'}
            onChange={(defaultIconColor) => updatePageSettings({ defaultIconColor })}
            showTransparent={false}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-200 mb-2">Page Info</h3>
        <p className="text-sm text-neutral-500">
          A4 Paper: {pageSettings.width} × {pageSettings.height} mm
        </p>
        <p className="text-sm text-neutral-500">
          Usable area:{' '}
          {pageSettings.width - pageSettings.marginLeft - pageSettings.marginRight} ×{' '}
          {pageSettings.height - pageSettings.marginTop - pageSettings.marginBottom} mm
        </p>
      </div>
    </div>
  );
}
