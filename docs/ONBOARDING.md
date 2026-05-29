# Частина 2: Онбординг

## Стек

- **react-hook-form** + **@hookform/resolvers/zod** — валідація по кроках
- **Zustand** (`persist`) — стан форми між кроками та після перезавантаження
- **shadcn/ui** — Button, Input, Card, Progress, Select, RadioGroup
- **framer-motion** — переходи між кроками (`StepTransition`, `OptionCard`)

## Маршрути

| URL | Опис |
|-----|------|
| `/onboarding` | 6-крокова форма |
| `/` | Головна (статус онбордингу) |
| `POST /api/onboarding/complete` | Збереження в Prisma |

## Кроки

1. Ім'я  
2. Вік, стать, зріст  
3. Вага, ціль, мета  
4. Рівень активності  
5. Спліт, таймер, одиниці  
6. КБЖУ + вода (кнопка «Розрахувати автоматично»)

## Zustand

Ключ LocalStorage: `gym-onboarding-v1`

```ts
import { useOnboardingStore } from "@/stores/onboarding-store";
```

## Запуск

```bash
npm install
npm run dev
```

Відкрийте http://localhost:3000/onboarding
