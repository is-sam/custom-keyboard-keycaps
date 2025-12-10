import { useState } from 'react';
import { useKeycapStore } from '../../store/keycapStore';
import { NumberInput } from '../ui/NumberInput';
import { ColorPicker } from '../ui/ColorPicker';
import { Button } from '../ui/Button';
import { IconPicker } from '../icons/IconPicker';
import { Modal } from '../ui/Modal';
import { Keycap } from './Keycap';
import { Image, Trash2, Copy, AlertTriangle } from 'lucide-react';

export function KeycapEditor() {
  const { keycaps, selectedKeycapId, pageSettings, updateKeycap, deleteKeycap, duplicateKeycap } =
    useKeycapStore();

  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const selectedKeycap = keycaps.find((k) => k.id === selectedKeycapId);

  if (!selectedKeycap) {
    return (
      <div className="p-4 text-center text-neutral-500">
        Select a keycap to edit its properties
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedKeycap>) => {
    updateKeycap(selectedKeycap.id, updates);
  };

  const handleTogglePlaceholder = () => {
    if (selectedKeycap.isPlaceholder) {
      // Convert from placeholder to normal keycap
      handleUpdate({
        isPlaceholder: false,
        backgroundColor: pageSettings.defaultBackgroundColor,
      });
    } else {
      // Convert from normal to placeholder
      handleUpdate({
        isPlaceholder: true,
        backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent
        icon: { type: 'none' },
        text: '',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Preview */}
      <div className="flex justify-center p-4 bg-neutral-800 rounded-lg">
        <Keycap
          keycap={selectedKeycap}
          cornerRadius={pageSettings.cornerRadius}
          scale={2}
        />
      </div>

      {/* Keycap Type Toggle */}
      <div>
        <label className="text-sm font-medium text-neutral-300 block mb-2">Keycap Type</label>
        <div className="flex gap-2">
          <Button
            variant={!selectedKeycap.isPlaceholder ? 'primary' : 'secondary'}
            onClick={() => {
              if (selectedKeycap.isPlaceholder) {
                handleTogglePlaceholder();
              }
            }}
            className="flex-1"
          >
            Normal
          </Button>
          <Button
            variant={selectedKeycap.isPlaceholder ? 'primary' : 'secondary'}
            onClick={() => {
              if (!selectedKeycap.isPlaceholder) {
                handleTogglePlaceholder();
              }
            }}
            className="flex-1"
          >
            Placeholder
          </Button>
        </div>
        {selectedKeycap.isPlaceholder && (
          <p className="text-xs text-neutral-500 mt-2">
            Placeholders are spacers that take up layout space but won't be printed.
          </p>
        )}
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Width"
          value={selectedKeycap.width}
          onChange={(width) => handleUpdate({ width })}
          min={5}
          max={50}
          step={0.5}
        />
        <NumberInput
          label="Height"
          value={selectedKeycap.height}
          onChange={(height) => handleUpdate({ height })}
          min={5}
          max={50}
          step={0.5}
        />
      </div>

      {/* Only show these options for non-placeholder keycaps */}
      {!selectedKeycap.isPlaceholder && (
        <>
          {/* Icon */}
          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-2">Icon</label>
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setIsIconPickerOpen(true)}
            >
              <Image size={16} />
              {selectedKeycap.icon.type === 'none'
                ? 'Select Icon'
                : selectedKeycap.icon.type === 'lucide'
                ? selectedKeycap.icon.name
                : 'Custom Image'}
            </Button>
          </div>

          {/* Colors */}
          <ColorPicker
            label="Background Color"
            value={selectedKeycap.backgroundColor}
            onChange={(backgroundColor) => handleUpdate({ backgroundColor })}
            showTransparent
          />

          {/* Icon Color - disabled for non-SVG custom images */}
          {selectedKeycap.icon.type === 'custom' &&
           selectedKeycap.icon.dataUrl &&
           !selectedKeycap.icon.dataUrl.includes('image/svg+xml') ? (
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-500 block">Icon Color</label>
              <div className="flex items-center gap-2 p-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-500">
                <AlertTriangle size={14} />
                <span className="text-xs">Color can't be changed for PNG/JPG images</span>
              </div>
            </div>
          ) : (
            <ColorPicker
              label="Icon Color"
              value={selectedKeycap.iconColor}
              onChange={(iconColor) => handleUpdate({ iconColor })}
              showTransparent={false}
            />
          )}

          {/* Text */}
          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-1">Text Label</label>
            <input
              type="text"
              value={selectedKeycap.text || ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Optional text..."
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedKeycap.text && (
            <>
              <ColorPicker
                label="Text Color"
                value={selectedKeycap.textColor || 'rgba(0, 0, 0, 1)'}
                onChange={(textColor) => handleUpdate({ textColor })}
                showTransparent={false}
              />

              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">
                  Text Position
                </label>
                <select
                  value={selectedKeycap.textPosition || 'below'}
                  onChange={(e) =>
                    handleUpdate({
                      textPosition: e.target.value as 'below' | 'above' | 'center',
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="below">Below Icon</option>
                  <option value="above">Above Icon</option>
                  <option value="center">Center (replaces icon)</option>
                </select>
              </div>
            </>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-800">
        <Button
          variant="secondary"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => duplicateKeycap(selectedKeycap.id)}
        >
          <Copy size={16} />
          Duplicate
        </Button>
        <Button
          variant="danger"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => deleteKeycap(selectedKeycap.id)}
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>

      {/* Icon Picker Modal */}
      <Modal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        title="Select Icon"
        size="lg"
      >
        <IconPicker
          currentIcon={selectedKeycap.icon}
          onSelect={(icon) => {
            handleUpdate({ icon });
            setIsIconPickerOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
