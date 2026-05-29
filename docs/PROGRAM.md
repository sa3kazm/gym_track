# Частина 4–5: Генератор програми & UI

## Двигун (`src/lib/program-engine/`)

### Вибір спліту
| Днів/тиж | Рекомендація |
|----------|----------------|
| 1–3 | Full Body |
| 4 | Upper / Lower |
| 5–6 | Push / Pull / Legs |

`AUTO` або явний вибір (з перевіркою сумісності).

### Підбір вправ
- Каталог 25+ вправ з обладнанням, категорією, `avoidInjuries`
- Фільтр: обладнання, травми, фокус сесії (Push/Pull/Legs…)
- Буст пріоритету для `priorityMuscles` (слабкі зони з аналізу)

### Параметри
- **Sets/Reps/RPE** за ціллю (LOSS/GAIN/MAINTAIN) та досвідом
- **Progressive overload** по тижнях (тиж. 2–3 навантаження, тиж. 4 deload)
- **Rest** — більше на компаундах

## API

| Метод | Шлях | Опис |
|-------|------|------|
| POST | `/api/program/generate` | Згенерувати 4-тижневу програму |
| GET | `/api/program/current` | Активний план |
| PATCH | `/api/program/sessions/:id` | `{ completed: true }` |

## UI — `/program`

- Форма генерації (дні, спліт, обладнання, травми, слабкі зони)
- Таби по тижнях
- Інтерактивні картки тренувань (розгортання, RPE, progressive overload notes)

## Seed (нові вправи)

```bash
npm run db:seed
```
