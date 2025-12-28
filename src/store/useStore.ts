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
  setEntropyLevel: (level: number) => void;
  setNewsData: (data: NewsItem[]) => void;
  increaseEntropy: (amount: number) => void;
}

export const useStore = create<AppState>((set) => ({
  entropyLevel: 0,
  newsData: [],
  setEntropyLevel: (level) => set({ entropyLevel: level }),
  setNewsData: (data) => set({ newsData: data }),
  increaseEntropy: (amount) => set((state) => ({ 
    entropyLevel: Math.min(1.0, state.entropyLevel + amount) 
  })),
}));
