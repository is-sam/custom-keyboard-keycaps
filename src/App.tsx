import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/layout/Canvas';
import { useKeycapStore } from './store/keycapStore';

function App() {
  const { addKeycap, deleteKeycap, duplicateKeycap, selectedKeycapId, recalculateLayout } =
    useKeycapStore();

  // Initialize layout on mount
  useEffect(() => {
    recalculateLayout();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + A: Add new keycap
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        addKeycap();
      }

      // Delete/Backspace: Delete selected keycap
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedKeycapId) {
        e.preventDefault();
        deleteKeycap(selectedKeycapId);
      }

      // Ctrl/Cmd + D: Duplicate selected keycap
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedKeycapId) {
        e.preventDefault();
        duplicateKeycap(selectedKeycapId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addKeycap, deleteKeycap, duplicateKeycap, selectedKeycapId]);

  return (
    <div className="h-screen flex flex-col bg-neutral-950">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
      </div>
    </div>
  );
}

export default App;
