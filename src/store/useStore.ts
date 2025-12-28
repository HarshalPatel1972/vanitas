
import { create } from 'zustand'

interface State {
  decayLevel: number
  setDecayLevel: (level: number) => void
}

export const useStore = create<State>((set) => ({
  decayLevel: 0,
  setDecayLevel: (level) => set({ decayLevel: level }),
}))
