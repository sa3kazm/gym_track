# Частина 3: Аналіз тіла & Summary

## Алгоритми (`src/lib/analysis/`)

| Модуль | Опис |
|--------|------|
| `bmi.ts` | BMI + категорія + score 0–100 |
| `bmr.ts` | Mifflin–St Jeor BMR, TDEE, activity score |
| `mccallum.ts` | Ідеальні обхвати від зап'ястя (множники McCallum) |
| `fitness-score.ts` | Зважений score: BMI 25% + пропорції 35% + ціль 20% + активність 20% |
| `weak-zones.ts` | Зони з відхиленням &lt; −5% від ідеалу + евристики без замірів |

### McCallum (від зап'ястя в дюймах × 2.54 → см)

- Груди ×6.5, стегна ×5.76, талія ×4.5, стегно ×3.44, шия/біцепс ×2.52, передпліччя ×1.88, литка ×2.34

## API

- `GET /api/analysis/summary` — повний аналіз профілю
- `PUT /api/body-measurements` — зберегти обхвати

## UI

- `/dashboard` — Summary screen (Fitness ring, метрики, слабкі зони, McCallum bars, форма замірів)

## БД

Після змін схеми:

```bash
npm run db:push
```
