import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertTriangle } from 'lucide-react';
import { processUploadedImage } from '../../utils/iconUtils';

interface IconUploaderProps {
  onUpload: (dataUrl: string) => void;
  currentDataUrl?: string;
}

export function IconUploader({ onUpload, currentDataUrl }: IconUploaderProps) {
  const [showNonSvgWarning, setShowNonSvgWarning] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const dataUrl = await processUploadedImage(file);
        if (dataUrl) {
          // Show warning if not an SVG
          setShowNonSvgWarning(file.type !== 'image/svg+xml');
          onUpload(dataUrl);
        }
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024, // 1MB
    noClick: false,
    noKeyboard: false,
    noDrag: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-900/30'
            : 'border-neutral-600 hover:border-neutral-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
        {isDragActive ? (
          <p className="text-blue-400">Drop the image here...</p>
        ) : (
          <div>
            <p className="text-neutral-300 mb-2">
              Drag and drop an image, or click to select
            </p>
            <p className="text-sm text-neutral-500">
              SVG, PNG, JPG, WEBP (max 1MB)
            </p>
          </div>
        )}
      </div>

      {showNonSvgWarning && (
        <div className="flex items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-400">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <p className="text-sm">
            PNG/JPG images can't have their color customized. Use SVG for color support.
          </p>
        </div>
      )}

      {currentDataUrl && (
        <div className="flex items-center gap-3 p-3 bg-neutral-700 rounded-lg">
          <div className="w-12 h-12 bg-neutral-800 rounded border border-neutral-600 flex items-center justify-center">
            <img
              src={currentDataUrl}
              alt="Current icon"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-200">Current custom icon</p>
            <p className="text-xs text-neutral-500">Click or drag to replace</p>
          </div>
        </div>
      )}
    </div>
  );
}
