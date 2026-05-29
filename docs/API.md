# API — Частина 1

Базовий URL: `http://localhost:3000/api`

Усі відповіді: `{ success: boolean, data?: T, error?: string, details?: unknown }`

## Profile

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/profile` | Активний профіль |
| POST | `/profile` | Створити профіль (+ TrainingPreferences) |
| GET | `/profile/:id` | Профіль за id |
| PATCH | `/profile/:id` | Оновити профіль |

## BodyMetrics

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/body-metrics` | Список (`?from=&to=&limit=`) |
| POST | `/body-metrics` | Новий запис ваги |
| GET/PATCH/DELETE | `/body-metrics/:id` | CRUD запису |

## TrainingPreferences

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/training-preferences` | Норми КБЖУ, таймер |
| PATCH | `/training-preferences` | Оновити налаштування |

## Exercise

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/exercises` | Бібліотека (`?q=&customOnly=`) |
| POST | `/exercises` | Кастомна вправа |
| GET/PATCH/DELETE | `/exercises/:id` | CRUD (вбудовані — read-only) |

## WorkoutPlan

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/workout-plans` | Усі плани профілю |
| POST | `/workout-plans` | Новий план |
| GET/PATCH/DELETE | `/workout-plans/:id` | CRUD плану |

`schedule` — JSON: `{ days: [{ id, name, exercises: [...] }] }`

## WorkoutSession

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/workout-sessions` | Журнал (`?from=&to=`) |
| POST | `/workout-sessions` | Нова сесія |
| GET/PATCH/DELETE | `/workout-sessions/:id` | CRUD сесії |

`exercises` — JSON: `[{ exerciseId, sets: [{ weightKg, reps, bodyWeightKg? }] }]`

## Запуск

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```
