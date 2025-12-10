import { useState } from 'react';
import { useKeycapStore } from '../../store/keycapStore';
import { Keycap } from './Keycap';
import { Plus, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

export function KeycapList() {
  const { keycaps, selectedKeycapId, pageSettings, addKeycap, addPlaceholder, selectKeycap, deleteKeycap } =
    useKeycapStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAddKeycap = () => {
    addKeycap();
    setShowDropdown(false);
  };

  const handleAddPlaceholder = () => {
    addPlaceholder();
    setShowDropdown(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <div className="flex gap-1">
          <Button
            onClick={handleAddKeycap}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Keycap
          </Button>
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-2"
            title="More options"
          >
            <ChevronDown size={18} />
          </Button>
        </div>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full mt-1 right-0 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-20 overflow-hidden">
              <button
                onClick={handleAddKeycap}
                className="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                Normal Keycap
              </button>
              <button
                onClick={handleAddPlaceholder}
                className="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                Placeholder / Spacer
              </button>
            </div>
          </>
        )}
      </div>

      {keycaps.length === 0 ? (
        <p className="text-center text-neutral-500 py-8">
          No keycaps yet. Click "Add Keycap" to start.
        </p>
      ) : (
        <div className="space-y-2">
          {keycaps.map((keycap, index) => (
            <div
              key={keycap.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                if (fromIndex !== toIndex) {
                  const newKeycaps = [...keycaps];
                  const [movedKeycap] = newKeycaps.splice(fromIndex, 1);
                  newKeycaps.splice(toIndex, 0, movedKeycap);
                  // Update the store with reordered keycaps
                  useKeycapStore.setState({ keycaps: newKeycaps });
                  useKeycapStore.getState().recalculateLayout();
                }
              }}
              className={`p-2 rounded-lg border cursor-move transition-colors ${
                selectedKeycapId === keycap.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => selectKeycap(keycap.id)}
                >
                  <Keycap
                    keycap={keycap}
                    cornerRadius={pageSettings.cornerRadius}
                    scale={0.8}
                  />
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => selectKeycap(keycap.id)}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-200 truncate">
                      {keycap.isPlaceholder ? 'Placeholder' : `Keycap ${index + 1}`}
                    </p>
                    {keycap.isPlaceholder && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-700 text-neutral-400 rounded">
                        spacer
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {keycap.width} × {keycap.height} mm
                  </p>
                  {keycap.text && !keycap.isPlaceholder && (
                    <p className="text-xs text-neutral-600 truncate">{keycap.text}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteKeycap(keycap.id);
                  }}
                  className="flex-shrink-0 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete keycap"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
