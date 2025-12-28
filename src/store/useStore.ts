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
      // Irreversible Entropy: It only goes UP.
      set((state) => {
        const newEntropy = Math.min(1.0, Math.max(state.entropyLevel, level));
        
        // Trigger lockout if we hit 1.0 (and haven't already locked)
        if (newEntropy >= 1.0 && !state.isLocked) {
             // We can't call triggerLockout here easily without get(), let's use a side effect logic or just set directly.
             // We need to trigger the side effect. 
             // Best way: check in the component or use subscription.
             // Or safer: just set properties.
             const lockTime = Date.now() + (60 * 60 * 1000); // 1 hour
             localStorage.setItem('vanitas_lockout', lockTime.toString());
             return { entropyLevel: newEntropy, isLocked: true, lockoutTime: lockTime };
        }
        
        return { entropyLevel: newEntropy };
      });
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
