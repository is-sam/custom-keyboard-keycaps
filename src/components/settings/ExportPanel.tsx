import { useState } from 'react';
import { useKeycapStore } from '../../store/keycapStore';
import { Button } from '../ui/Button';
import { NumberInput } from '../ui/NumberInput';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToPNG } from '../../utils/imageExport';
import { FileImage, FileText, Loader2 } from 'lucide-react';

export function ExportPanel() {
  const { layout, pageSettings, exportSettings, updateExportSettings, keycaps } =
    useKeycapStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (keycaps.length === 0) return;

    setIsExporting(true);
    try {
      await exportToPDF(layout, pageSettings);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (keycaps.length === 0) return;

    setIsExporting(true);
    try {
      await exportToPNG(layout, pageSettings, exportSettings.dpi);
    } catch (e) {
      console.error('PNG export failed:', e);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const validKeycaps = layout.filter((k) => k.x >= 0 && k.y >= 0);
  const overflowKeycaps = layout.filter((k) => k.x < 0 || k.y < 0);

  return (
    <div className="p-4 space-y-6">
      {/* Status */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-neutral-200 mb-2">Export Status</h3>
        <div className="space-y-1 text-sm">
          <p className="text-neutral-400">
            <span className="font-medium text-neutral-200">{keycaps.length}</span> total keycaps
          </p>
          <p className="text-green-400">
            <span className="font-medium">{validKeycaps.length}</span> will be exported
          </p>
          {overflowKeycaps.length > 0 && (
            <p className="text-amber-400">
              <span className="font-medium">{overflowKeycaps.length}</span> don't fit on page
            </p>
          )}
        </div>
      </div>

      {/* Export settings */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3">PNG Settings</h3>
        <NumberInput
          label="DPI (Resolution)"
          value={exportSettings.dpi}
          onChange={(dpi) => updateExportSettings({ dpi })}
          min={72}
          max={600}
          step={1}
          unit="dpi"
        />
        <p className="text-xs text-neutral-500 mt-1">
          300 DPI recommended for high-quality printing
        </p>
      </div>

      {/* Export buttons */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <Button
          onClick={handleExportPDF}
          disabled={isExporting || keycaps.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <FileText size={18} />
          )}
          Export as PDF
        </Button>

        <Button
          variant="secondary"
          onClick={handleExportPNG}
          disabled={isExporting || keycaps.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <FileImage size={18} />
          )}
          Export as PNG
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-neutral-500 space-y-2">
        <p>
          <strong className="text-neutral-400">PDF:</strong> Best for printing. Vector graphics stay crisp at any size.
        </p>
        <p>
          <strong className="text-neutral-400">PNG:</strong> High-resolution image at the specified DPI. Good for preview or digital use.
        </p>
      </div>

      {keycaps.length === 0 && (
        <p className="text-center text-neutral-500 text-sm py-4">
          Add keycaps before exporting
        </p>
      )}
    </div>
  );
}
