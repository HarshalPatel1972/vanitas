
import { create } from 'zustand'

interface State {
  entropyLevel: number
  setEntropyLevel: (level: number) => void
  isRecompiling: boolean
  setIsRecompiling: (status: boolean) => void
}

export const useStore = create<State>((set) => ({
  entropyLevel: 0,
  setEntropyLevel: (level) => set({ entropyLevel: level }),
  isRecompiling: false,
  setIsRecompiling: (status) => set({ isRecompiling: status }),
}))
