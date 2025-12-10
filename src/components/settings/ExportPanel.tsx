import { useState, useRef } from 'react';
import { useKeycapStore } from '../../store/keycapStore';
import { Button } from '../ui/Button';
import { NumberInput } from '../ui/NumberInput';
import { exportToPDF } from '../../utils/pdfExport';
import { exportToPNG } from '../../utils/imageExport';
import { FileImage, FileText, Loader2, Printer, Download, Upload } from 'lucide-react';

export function ExportPanel() {
  const { layout, pageSettings, exportSettings, updateExportSettings, keycaps } =
    useKeycapStore();
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPDF = async () => {
    if (keycaps.length === 0) return;

    setIsExporting(true);
    try {
      await exportToPDF(layout, pageSettings, false);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = async () => {
    if (keycaps.length === 0) return;

    setIsExporting(true);
    try {
      await exportToPDF(layout, pageSettings, true);
    } catch (e) {
      console.error('PDF print failed:', e);
      alert('Failed to open PDF for printing. Please try again.');
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

  const handleExportJSON = () => {
    const state = useKeycapStore.getState();
    const data = {
      keycaps: state.keycaps,
      pageSettings: state.pageSettings,
      exportSettings: state.exportSettings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keycaps-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate the data structure
        if (!data.keycaps || !Array.isArray(data.keycaps)) {
          throw new Error('Invalid data format: missing keycaps array');
        }

        const state = useKeycapStore.getState();

        // Update the store with imported data
        useKeycapStore.setState({
          keycaps: data.keycaps,
          pageSettings: { ...state.pageSettings, ...data.pageSettings },
          exportSettings: { ...state.exportSettings, ...data.exportSettings },
          selectedKeycapId: null,
        });

        // Recalculate layout
        state.recalculateLayout();

        alert('Configuration imported successfully!');
      } catch (e) {
        console.error('JSON import failed:', e);
        alert('Failed to import configuration. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const validKeycaps = layout.filter((k) => k.x >= 0 && k.y >= 0);
  const overflowKeycaps = layout.filter((k) => k.x < 0 || k.y < 0);

  return (
    <div className="p-4 space-y-6">
      {/* Status */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-neutral-200 mb-2">Print Status</h3>
        <div className="space-y-1 text-sm">
          <p className="text-neutral-400">
            <span className="font-medium text-neutral-200">{keycaps.length}</span> total keycaps
          </p>
          <p className="text-green-400">
            <span className="font-medium">{validKeycaps.length}</span> will be printed
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

      {/* Print and Export buttons */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-200">Print & Export</h3>

        <Button
          onClick={handlePrintPDF}
          disabled={isExporting || keycaps.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Printer size={18} />
          )}
          Print
        </Button>

        <Button
          variant="secondary"
          onClick={handleExportPDF}
          disabled={isExporting || keycaps.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <FileText size={18} />
          )}
          Export PDF
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
          Export PNG
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-neutral-500 space-y-2">
        <p>
          <strong className="text-neutral-400">Print:</strong> Opens PDF in new window for direct printing.
        </p>
        <p>
          <strong className="text-neutral-400">Export PDF:</strong> Download PDF file. Vector graphics stay crisp at any size.
        </p>
        <p>
          <strong className="text-neutral-400">Export PNG:</strong> High-resolution image at the specified DPI. Good for preview or digital use.
        </p>
      </div>

      {/* Configuration Import/Export */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-200">Configuration</h3>

        <Button
          variant="secondary"
          onClick={handleExportJSON}
          className="w-full flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Export Configuration
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />

        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          Import Configuration
        </Button>
      </div>

      <div className="text-xs text-neutral-500">
        <p>
          Save and restore your entire keycap configuration as JSON. This includes all keycaps, settings, and layout preferences.
        </p>
      </div>

      {keycaps.length === 0 && (
        <p className="text-center text-neutral-500 text-sm py-4">
          Add keycaps before printing or exporting
        </p>
      )}
    </div>
  );
}
