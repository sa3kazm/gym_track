export const ONBOARDING_STEPS_META = [
  {
    id: "welcome",
    title: "Вітаємо!",
    subtitle: "Як до вас звертатися?",
  },
  {
    id: "about",
    title: "Про вас",
    subtitle: "Базові дані для розрахунків",
  },
  {
    id: "body",
    title: "Тіло та ціль",
    subtitle: "Поточна вага і куди рухаємось",
  },
  {
    id: "activity",
    title: "Активність",
    subtitle: "Як часто ви тренуєтесь?",
  },
  {
    id: "training",
    title: "Тренування",
    subtitle: "Налаштування програм і таймера",
  },
  {
    id: "nutrition",
    title: "Харчування",
    subtitle: "Денні норми КБЖУ та води",
  },
] as const;

export const GOAL_OPTIONS = [
  { value: "LOSS", label: "Схуднення", emoji: "🔥" },
  { value: "GAIN", label: "Набір маси", emoji: "💪" },
  { value: "MAINTAIN", label: "Підтримка", emoji: "⚖️" },
] as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Чоловіча" },
  { value: "FEMALE", label: "Жіноча" },
  { value: "OTHER", label: "Інша" },
] as const;

export const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY", label: "Малорухливий", desc: "Офіс, мало руху" },
  { value: "LIGHT", label: "Легка", desc: "1–2 трен./тиж." },
  { value: "MODERATE", label: "Помірна", desc: "3–4 трен./тиж." },
  { value: "ACTIVE", label: "Висока", desc: "5–6 трен./тиж." },
  { value: "VERY_ACTIVE", label: "Дуже висока", desc: "Щодня + фіз. робота" },
] as const;

export const SPLIT_OPTIONS = [
  { value: "PPL", label: "Push / Pull / Legs" },
  { value: "UPPER_LOWER", label: "Upper / Lower" },
  { value: "FULL_BODY", label: "Full Body" },
  { value: "CUSTOM", label: "Свій розклад" },
] as const;
