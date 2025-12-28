
import { create } from 'zustand'

interface State {
  decayLevel: number
  setDecayLevel: (level: number) => void
  isRepairing: boolean
  setRepairing: (status: boolean) => void
}

export const useStore = create<State>((set) => ({
  decayLevel: 0,
  setDecayLevel: (level) => set({ decayLevel: level }),
  isRepairing: false,
  setRepairing: (status) => set({ isRepairing: status }),
}))
