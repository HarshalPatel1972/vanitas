import { create } from 'zustand';
import { MOCK_NEWS } from '../lib/mockData';

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  image: string;
  summary: string; // Added for redaction demo
}

interface AppState {
  entropyLevel: number;
  newsData: NewsItem[];
  isLocked: boolean;
  lockoutTime: number | null;
  
  setEntropyLevel: (level: number) => void;
  setNewsData: (data: NewsItem[]) => void;
  triggerLockout: () => void;
  checkLockout: () => void;
  quickYield: () => void; // Dev tool
}

export const useStore = create<AppState>((set, get) => ({
  entropyLevel: 0,
  newsData: [],
  isLocked: false,
  lockoutTime: null,

  setEntropyLevel: (level) => {
      // Entropy only goes UP? Or dynamic with scroll?
      // Prompt says "Increases with scroll depth".
      // Let's make it reflect current depth strictly for this version 'Signal Loss'.
      set({ entropyLevel: Math.min(1.0, Math.max(0, level)) });
      
      if (get().entropyLevel >= 1.0 && !get().isLocked) {
          get().triggerLockout();
      }
  },

  setNewsData: (data) => set({ newsData: data }),
  
  triggerLockout: () => {
      const lockTime = Date.now() + (60 * 60 * 1000); // 1 hour
      localStorage.setItem('vanitas_lockout', lockTime.toString());
      set({ isLocked: true, lockoutTime: lockTime });
  },

  checkLockout: () => {
      const stored = localStorage.getItem('vanitas_lockout');
      if (stored) {
          const time = parseInt(stored);
          if (time > Date.now()) {
              set({ isLocked: true, lockoutTime: time });
          } else {
              set({ isLocked: false, lockoutTime: null });
              localStorage.removeItem('vanitas_lockout');
          }
      }
  },
  
  quickYield: () => {
      // Dev helper to unlock
      localStorage.removeItem('vanitas_lockout');
      set({ isLocked: false, lockoutTime: null, entropyLevel: 0.99 });
  }
}));
