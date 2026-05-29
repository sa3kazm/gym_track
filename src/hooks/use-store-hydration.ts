"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";

/** Чекаємо rehydrate Zustand persist перед рендером форми */
export function useOnboardingHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinish = useOnboardingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useOnboardingStore.persist.hasHydrated());

    return unsubFinish;
  }, []);

  return hydrated;
}
