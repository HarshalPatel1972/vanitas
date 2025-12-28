import { create } from 'zustand';

export interface NewsItem {
  title: string;
  image: string;
  source: string;
  date: string;
  url: string;
}

interface AppState {
  entropyLevel: number;
  newsData: NewsItem[];
  isRepairing: boolean;
  repairEndTime: number | null;
  setEntropyLevel: (level: number) => void; // Deprecated for external use in favor of increase only, but kept for reset
  increaseEntropyTo: (targetLevel: number) => void;
  setNewsData: (data: NewsItem[]) => void;
  startRepair: (durationMs: number) => void;
  checkRepairStatus: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  entropyLevel: 0,
  newsData: [],
  isRepairing: false,
  repairEndTime: null,
  setEntropyLevel: (level) => set({ entropyLevel: level }),
  increaseEntropyTo: (targetLevel) => set((state) => ({ 
    // Irreversible: only increase, never decrease (unless we explicitly reset, which isn't requested yet)
    entropyLevel: Math.max(state.entropyLevel, Math.min(1.0, targetLevel)) 
  })),
  setNewsData: (data) => set({ newsData: data }),
  startRepair: (durationMs) => {
    const endTime = Date.now() + durationMs;
    // Persist to localStorage if needed, simple state for now
    if (typeof window !== 'undefined') {
        localStorage.setItem('vanitas_repair_end', endTime.toString());
    }
    set({ isRepairing: true, repairEndTime: endTime });
  },
  checkRepairStatus: () => {
    if (typeof window !== 'undefined') {
        const storedEnd = localStorage.getItem('vanitas_repair_end');
        if (storedEnd) {
            const remaining = parseInt(storedEnd) - Date.now();
            if (remaining > 0) {
                 set({ isRepairing: true, repairEndTime: parseInt(storedEnd) });
            } else {
                 set({ isRepairing: false, repairEndTime: null, entropyLevel: 0 }); // Reset on complete?
                 localStorage.removeItem('vanitas_repair_end');
            }
        }
    }
  }
}));
