# Харчування

## Маршрут
**http://localhost:3000/nutrition**

## Можливості
- Пошук ~30 вбудованих продуктів + свої кастомні
- 4 прийоми їжі: сніданок, обід, вечеря, перекуси
- Прогрес-бари КБЖУ (норми з онбордингу / TrainingPreferences)
- Видалення записів

## API
| Метод | Шлях |
|-------|------|
| GET | `/api/foods?q=` |
| POST | `/api/foods` |
| DELETE | `/api/foods/:id` |
| GET | `/api/nutrition?date=` |
| POST | `/api/nutrition` |
| DELETE | `/api/nutrition/entries/:id` |

## БД (після оновлення схеми)
```bash
npm run db:push
npm run db:seed
```
