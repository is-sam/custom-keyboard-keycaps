import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Keycap, PageSettings, ExportSettings, PositionedKeycap } from '../types/keycap';
import {
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  DEFAULT_KEYCAP_WIDTH_MM,
  DEFAULT_KEYCAP_HEIGHT_MM,
  DEFAULT_SPACING_MM,
  DEFAULT_MARGIN_MM,
  DEFAULT_CORNER_RADIUS_MM,
  PRINT_DPI,
} from '../constants/dimensions';
import { packKeycaps } from '../utils/binPacking';

interface KeycapStore {
  // State
  keycaps: Keycap[];
  selectedKeycapId: string | null;
  pageSettings: PageSettings;
  exportSettings: ExportSettings;
  layout: PositionedKeycap[];

  // Keycap actions
  addKeycap: (keycap?: Partial<Keycap>) => void;
  addPlaceholder: () => void;
  updateKeycap: (id: string, updates: Partial<Keycap>) => void;
  deleteKeycap: (id: string) => void;
  duplicateKeycap: (id: string) => void;
  selectKeycap: (id: string | null) => void;

  // Settings actions
  updatePageSettings: (updates: Partial<PageSettings>) => void;
  updateExportSettings: (updates: Partial<ExportSettings>) => void;

  // Layout
  recalculateLayout: () => void;
}

const defaultPageSettings: PageSettings = {
  width: A4_WIDTH_MM,
  height: A4_HEIGHT_MM,
  marginTop: DEFAULT_MARGIN_MM,
  marginRight: DEFAULT_MARGIN_MM,
  marginBottom: DEFAULT_MARGIN_MM,
  marginLeft: DEFAULT_MARGIN_MM,
  spacing: DEFAULT_SPACING_MM,
  cornerRadius: DEFAULT_CORNER_RADIUS_MM,
  showCutGuides: true,
  defaultIconColor: 'rgba(0, 0, 0, 1)',
  defaultBackgroundColor: 'rgba(255, 255, 255, 1)',
  defaultKeycapWidth: DEFAULT_KEYCAP_WIDTH_MM,
  defaultKeycapHeight: DEFAULT_KEYCAP_HEIGHT_MM,
};

const defaultExportSettings: ExportSettings = {
  format: 'pdf',
  dpi: PRINT_DPI,
};

const createDefaultKeycap = (
  overrides?: Partial<Keycap>,
  pageSettings?: PageSettings
): Keycap => ({
  id: uuidv4(),
  width: pageSettings?.defaultKeycapWidth || DEFAULT_KEYCAP_WIDTH_MM,
  height: pageSettings?.defaultKeycapHeight || DEFAULT_KEYCAP_HEIGHT_MM,
  icon: { type: 'none' },
  iconColor: pageSettings?.defaultIconColor || 'rgba(0, 0, 0, 1)',
  backgroundColor: pageSettings?.defaultBackgroundColor || 'rgba(255, 255, 255, 1)',
  text: '',
  textColor: pageSettings?.defaultIconColor || 'rgba(0, 0, 0, 1)',
  textPosition: 'below',
  ...overrides,
});

export const useKeycapStore = create<KeycapStore>()(
  persist(
    (set, get) => ({
      keycaps: [],
      selectedKeycapId: null,
      pageSettings: defaultPageSettings,
      exportSettings: defaultExportSettings,
      layout: [],

      addKeycap: (keycap) => {
        const state = get();
        const newKeycap = createDefaultKeycap(keycap, state.pageSettings);
        set((state) => ({
          keycaps: [...state.keycaps, newKeycap],
          selectedKeycapId: newKeycap.id,
        }));
        get().recalculateLayout();
      },

      addPlaceholder: () => {
        const state = get();
        const newKeycap = createDefaultKeycap({
          isPlaceholder: true,
          backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent
          icon: { type: 'none' },
        }, state.pageSettings);
        set((state) => ({
          keycaps: [...state.keycaps, newKeycap],
          selectedKeycapId: newKeycap.id,
        }));
        get().recalculateLayout();
      },

      updateKeycap: (id, updates) => {
        set((state) => ({
          keycaps: state.keycaps.map((k) =>
            k.id === id ? { ...k, ...updates } : k
          ),
        }));
        get().recalculateLayout();
      },

      deleteKeycap: (id) => {
        set((state) => ({
          keycaps: state.keycaps.filter((k) => k.id !== id),
          selectedKeycapId: state.selectedKeycapId === id ? null : state.selectedKeycapId,
        }));
        get().recalculateLayout();
      },

      duplicateKeycap: (id) => {
        const state = get();
        const keycap = state.keycaps.find((k) => k.id === id);
        if (keycap) {
          const newKeycap = { ...keycap, id: uuidv4() };
          set((state) => ({
            keycaps: [...state.keycaps, newKeycap],
            selectedKeycapId: newKeycap.id,
          }));
          get().recalculateLayout();
        }
      },

      selectKeycap: (id) => {
        set({ selectedKeycapId: id });
      },

      updatePageSettings: (updates) => {
        set((state) => ({
          pageSettings: { ...state.pageSettings, ...updates },
        }));
        get().recalculateLayout();
      },

      updateExportSettings: (updates) => {
        set((state) => ({
          exportSettings: { ...state.exportSettings, ...updates },
        }));
      },

      recalculateLayout: () => {
        const state = get();
        const layout = packKeycaps(state.keycaps, state.pageSettings);
        set({ layout });
      },
    }),
    {
      name: 'keycap-storage',
      partialize: (state) => ({
        keycaps: state.keycaps,
        pageSettings: state.pageSettings,
        exportSettings: state.exportSettings,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<KeycapStore> | undefined;
        return {
          ...currentState,
          ...persisted,
          // Merge pageSettings with defaults to handle new fields
          pageSettings: {
            ...currentState.pageSettings,
            ...persisted?.pageSettings,
          },
          exportSettings: {
            ...currentState.exportSettings,
            ...persisted?.exportSettings,
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        // Recalculate layout after rehydration
        if (state) {
          state.recalculateLayout();
        }
      },
    }
  )
);
