import { useState, useEffect } from 'react';
import { KeycapList } from '../keycap/KeycapList';
import { KeycapEditor } from '../keycap/KeycapEditor';
import { PageSettings } from '../settings/PageSettings';
import { ExportPanel } from '../settings/ExportPanel';
import { useKeycapStore } from '../../store/keycapStore';
import { List, Edit, Settings, Printer } from 'lucide-react';

type Tab = 'keycaps' | 'editor' | 'settings' | 'print';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('keycaps');
  const { selectedKeycapId } = useKeycapStore();

  // Auto-switch to editor when a keycap is selected
  useEffect(() => {
    if (selectedKeycapId && activeTab === 'keycaps') {
      setActiveTab('editor');
    }
  }, [selectedKeycapId]);

  // Auto-switch to keycaps when no keycap is selected from editor
  useEffect(() => {
    if (!selectedKeycapId && activeTab === 'editor') {
      setActiveTab('keycaps');
    }
  }, [selectedKeycapId, activeTab]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'keycaps', label: 'Keycaps', icon: <List size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Edit size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    { id: 'print', label: 'Print', icon: <Printer size={18} /> },
  ];

  return (
    <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-500 bg-neutral-800'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'keycaps' && <KeycapList />}
        {activeTab === 'editor' && <KeycapEditor />}
        {activeTab === 'settings' && <PageSettings />}
        {activeTab === 'print' && <ExportPanel />}
      </div>
    </div>
  );
}
