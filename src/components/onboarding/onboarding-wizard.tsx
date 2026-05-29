"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import {
  onboardingFormSchema,
  ONBOARDING_STEP_FIELDS,
  type OnboardingFormValues,
} from "@/lib/validations/onboarding";
import { ONBOARDING_STEPS_META } from "@/lib/onboarding/steps-config";
import { useOnboardingHydration } from "@/hooks/use-store-hydration";
import {
  ONBOARDING_STEPS_COUNT,
  useOnboardingStore,
} from "@/stores/onboarding-store";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";
import { StepTransition } from "@/components/onboarding/step-transition";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function OnboardingWizard() {
  const router = useRouter();
  const hydrated = useOnboardingHydration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    currentStep,
    formData,
    nextStep,
    prevStep,
    patchFormData,
    setFormData,
    setCompleted,
  } = useOnboardingStore();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: formData,
    mode: "onTouched",
  });

  useEffect(() => {
    form.reset(useOnboardingStore.getState().formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync лише при зміні кроку
  }, [currentStep]);

  const meta = ONBOARDING_STEPS_META[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS_COUNT) * 100;
  const isLastStep = currentStep === ONBOARDING_STEPS_COUNT - 1;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleNext = async () => {
    setSubmitError(null);
    const fields = ONBOARDING_STEP_FIELDS[currentStep];
    const valid = await form.trigger(fields);
    if (!valid) return;

    const values = form.getValues();
    patchFormData(values);

    if (!isLastStep) {
      nextStep();
      return;
    }

    await completeOnboarding(values);
  };

  const completeOnboarding = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = (await res.json()) as {
        success: boolean;
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Не вдалося зберегти дані");
      }

      setFormData(values);
      setCompleted(true);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Помилка збереження. Спробуйте ще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-2"
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Крок {currentStep + 1} з {ONBOARDING_STEPS_COUNT}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </motion.div>

        <Card className="overflow-hidden border-border/80">
          <CardHeader>
            <CardTitle>{meta.title}</CardTitle>
            <CardDescription>{meta.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[280px]">
            <StepTransition stepKey={currentStep}>
              <OnboardingSteps step={currentStep} />
            </StepTransition>

            {submitError && (
              <p className="mt-4 text-sm text-primary" role="alert">
                {submitError}
              </p>
            )}
          </CardContent>
        </Card>

        <motion.div
          layout
          className="mt-6 flex items-center justify-between gap-3"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastStep ? (
              <Check className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isSubmitting
              ? "Зберігаємо…"
              : isLastStep
                ? "Завершити"
                : "Далі"}
          </Button>
        </motion.div>
      </div>
    </FormProvider>
  );
}
