import { Keyboard } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
      <Keyboard className="h-6 w-6 text-blue-500" />
      <h1 className="text-lg font-semibold text-neutral-100">
        Keycap Designer
      </h1>
      <span className="text-sm text-neutral-400">
        Create custom keycap stickers for printing
      </span>
    </header>
  );
}
