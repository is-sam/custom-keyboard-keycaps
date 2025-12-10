import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { IconConfig } from '../../types/keycap';
import { KEYBOARD_ICONS, ALL_ICONS } from '../../constants/icons';
import { getLucideIcon } from '../../utils/iconUtils';
import { IconUploader } from './IconUploader';
import { Button } from '../ui/Button';

interface IconPickerProps {
  currentIcon: IconConfig;
  onSelect: (icon: IconConfig) => void;
}

export function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIcons = useMemo(() => {
    let icons = selectedCategory
      ? KEYBOARD_ICONS[selectedCategory as keyof typeof KEYBOARD_ICONS]
      : ALL_ICONS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      icons = icons.filter((name) => name.toLowerCase().includes(query));
    }

    return icons;
  }, [selectedCategory, searchQuery]);

  const categories = Object.keys(KEYBOARD_ICONS);

  const handleSelectLucideIcon = (name: string) => {
    onSelect({ type: 'lucide', name });
  };

  const handleUploadIcon = (dataUrl: string) => {
    onSelect({ type: 'custom', dataUrl });
  };

  const handleRemoveIcon = () => {
    onSelect({ type: 'none' });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-neutral-700">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'library'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Icon Library
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Upload Custom
        </button>
      </div>

      {activeTab === 'library' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Icons grid */}
          <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1">
            {filteredIcons.map((iconName) => {
              const IconComponent = getLucideIcon(iconName);
              if (!IconComponent) return null;

              const isSelected =
                currentIcon.type === 'lucide' && currentIcon.name === iconName;

              return (
                <button
                  key={iconName}
                  onClick={() => handleSelectLucideIcon(iconName)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-900/50'
                      : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-700'
                  }`}
                  title={iconName}
                >
                  <IconComponent className="w-6 h-6 mx-auto text-neutral-200" />
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <p className="text-center text-neutral-500 py-4">
              No icons found matching "{searchQuery}"
            </p>
          )}
        </>
      )}

      {activeTab === 'upload' && (
        <IconUploader
          onUpload={handleUploadIcon}
          currentDataUrl={currentIcon.type === 'custom' ? currentIcon.dataUrl : undefined}
        />
      )}

      {/* Remove icon button */}
      {currentIcon.type !== 'none' && (
        <Button
          variant="secondary"
          onClick={handleRemoveIcon}
          className="w-full"
        >
          Remove Icon
        </Button>
      )}
    </div>
  );
}
