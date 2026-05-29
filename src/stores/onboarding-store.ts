import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultOnboardingValues,
  type OnboardingFormValues,
} from "@/lib/validations/onboarding";

export const ONBOARDING_STEPS_COUNT = 6;
export const ONBOARDING_STORAGE_KEY = "gym-onboarding-v1";

interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormValues;
  isCompleted: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  patchFormData: (partial: Partial<OnboardingFormValues>) => void;
  setFormData: (data: OnboardingFormValues) => void;
  setCompleted: (value: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      formData: { ...defaultOnboardingValues },
      isCompleted: false,

      setStep: (step) =>
        set({
          currentStep: Math.max(0, Math.min(step, ONBOARDING_STEPS_COUNT - 1)),
        }),

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < ONBOARDING_STEPS_COUNT - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      patchFormData: (partial) =>
        set((state) => ({
          formData: { ...state.formData, ...partial },
        })),

      setFormData: (data) => set({ formData: data }),

      setCompleted: (value) => set({ isCompleted: value }),

      reset: () =>
        set({
          currentStep: 0,
          formData: { ...defaultOnboardingValues },
          isCompleted: false,
        }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        isCompleted: state.isCompleted,
      }),
    }
  )
);
