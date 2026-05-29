import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Онбординг | Gym Track",
  description: "Налаштування профілю та цілей",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
