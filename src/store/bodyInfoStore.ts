import { create } from 'zustand'
import { BodyInfo } from '@/types/bodyInfo'

interface BodyInfoStore {
  bodyInfo: BodyInfo | null
  setBodyInfo: (bodyInfo: BodyInfo) => void
  updateField: <K extends keyof BodyInfo>(key: K, value: BodyInfo[K]) => void
  reset: () => void
}

export const useBodyInfoStore = create<BodyInfoStore>((set) => ({
  bodyInfo: null,
  setBodyInfo: (bodyInfo) => set({ bodyInfo }),
  updateField: (key, value) =>
    set((state) => ({
      bodyInfo: state.bodyInfo ? { ...state.bodyInfo, [key]: value } : null,
    })),
  reset: () => set({ bodyInfo: null }),
}))
