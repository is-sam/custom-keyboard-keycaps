import { useKeycapStore } from '../../store/keycapStore';
import { Keycap } from './Keycap';
import { Plus, Square } from 'lucide-react';
import { Button } from '../ui/Button';

export function KeycapList() {
  const { keycaps, selectedKeycapId, pageSettings, addKeycap, addPlaceholder, selectKeycap } =
    useKeycapStore();

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => addKeycap()}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Keycap
        </Button>
        <Button
          variant="secondary"
          onClick={() => addPlaceholder()}
          className="flex items-center justify-center gap-2"
          title="Add placeholder (spacer that won't print)"
        >
          <Square size={20} className="opacity-50" />
        </Button>
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
              onClick={() => selectKeycap(keycap.id)}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                selectedKeycapId === keycap.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Keycap
                    keycap={keycap}
                    cornerRadius={pageSettings.cornerRadius}
                    scale={0.8}
                  />
                </div>
                <div className="flex-1 min-w-0">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
