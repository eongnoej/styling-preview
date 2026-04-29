import { create } from 'zustand'

type AppStep = 1 | 2 | 3 | 4 | 5 | 6

interface AppStore {
  currentStep: AppStep
  setStep: (step: AppStep) => void
  nextStep: () => void
  previousStep: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({
      currentStep: (Math.min(state.currentStep + 1, 6) as AppStep),
    })),
  previousStep: () =>
    set((state) => ({
      currentStep: (Math.max(state.currentStep - 1, 1) as AppStep),
    })),
}))
