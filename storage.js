/**
 * storage.js
 * Gym & Nutrition Tracker — Abstraction Layer для зберігання даних
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ВАЖЛИВО: Весь додаток звертається до даних ТІЛЬКИ через цей   ║
 * ║  сервіс. Щоб перейти на REST API — замінюємо тіла методів на   ║
 * ║  fetch()-виклики. Жоден інший файл не чіпаємо.                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Ключі LocalStorage:
 *   gnt_profile               — профіль користувача
 *   gnt_programs              — програми тренувань
 *   gnt_exercise_library      — бібліотека вправ
 *   gnt_workout_log           — щоденник тренувань
 *   gnt_nutrition_log         — щоденник харчування
 *   gnt_food_database_custom  — кастомні продукти юзера
 *   gnt_water_log             — трекер води
 *   gnt_achievements          — ачівки та стріки
 */

import FOOD_DATABASE from "./foodDatabase.js";

// ─── Константи ────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = Object.freeze({
  PROFILE: "gnt_profile",
  PROGRAMS: "gnt_programs",
  EXERCISE_LIBRARY: "gnt_exercise_library",
  WORKOUT_LOG: "gnt_workout_log",
  NUTRITION_LOG: "gnt_nutrition_log",
  FOOD_DB_CUSTOM: "gnt_food_database_custom",
  WATER_LOG: "gnt_water_log",
  ACHIEVEMENTS: "gnt_achievements",
});

// ─── Дефолтні значення (при першому запуску) ─────────────────────────────────

const DEFAULTS = {
  [STORAGE_KEYS.PROFILE]: {
    name: "",
    age: null,
    gender: "male",
    height: null,
    currentWeight: null,
    targetWeight: null,
    goal: "maintain", // "loss" | "gain" | "maintain"
    activityLevel: "moderate",
    dailyGoals: {
      calories: 2000,
      protein: 150,
      fat: 65,
      carbs: 220,
      water: 2000,
    },
    weightHistory: [],
  },

  [STORAGE_KEYS.PROGRAMS]: [],

  [STORAGE_KEYS.EXERCISE_LIBRARY]: [
    // Базові вправи "з коробки"
    { id: "ex_001", name: "Жим штанги лежачи",    category: "chest",    equipment: "barbell",    isCustom: false },
    { id: "ex_002", name: "Присідання зі штангою", category: "legs",     equipment: "barbell",    isCustom: false },
    { id: "ex_003", name: "Станова тяга",           category: "back",     equipment: "barbell",    isCustom: false },
    { id: "ex_004", name: "Підтягування",           category: "back",     equipment: "bodyweight", isCustom: false },
    { id: "ex_005", name: "Жим гантелей сидячи",   category: "shoulders",equipment: "dumbbell",   isCustom: false },
    { id: "ex_006", name: "Підйом на біцепс (штанга)", category: "arms", equipment: "barbell",    isCustom: false },
    { id: "ex_007", name: "Трицепс на блоці",      category: "arms",     equipment: "cable",      isCustom: false },
    { id: "ex_008", name: "Віджимання",             category: "chest",    equipment: "bodyweight", isCustom: false },
    { id: "ex_009", name: "Жим ногами",             category: "legs",     equipment: "machine",    isCustom: false },
    { id: "ex_010", name: "Тяга верхнього блоку",   category: "back",     equipment: "cable",      isCustom: false },
    { id: "ex_011", name: "Планка",                 category: "core",     equipment: "bodyweight", isCustom: false },
    { id: "ex_012", name: "Скручування",            category: "core",     equipment: "bodyweight", isCustom: false },
  ],

  [STORAGE_KEYS.WORKOUT_LOG]: [],
  [STORAGE_KEYS.NUTRITION_LOG]: [],
  [STORAGE_KEYS.FOOD_DB_CUSTOM]: [],

  [STORAGE_KEYS.WATER_LOG]: [],

  [STORAGE_KEYS.ACHIEVEMENTS]: {
    unlocked: [],
    streakDays: 0,
    lastWorkoutDate: null,
    checks: {},
  },
};

// ─── Низькорівневий примітив ──────────────────────────────────────────────────

const _storage = {
  /** Зчитати та розпарсити. Якщо ключа немає — повернути null. */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`[Storage] get("${key}") failed:`, e);
      return null;
    }
  },

  /** Серіалізувати та зберегти. */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] set("${key}") failed:`, e);
      return false;
    }
  },

  /** Видалити ключ. */
  remove(key) {
    localStorage.removeItem(key);
  },
};

// ─── Ініціалізація (запустити один раз при старті додатку) ───────────────────

export function initStorage() {
  Object.entries(DEFAULTS).forEach(([key, defaultValue]) => {
    if (_storage.get(key) === null) {
      _storage.set(key, defaultValue);
      console.info(`[Storage] Ініціалізовано ключ: ${key}`);
    }
  });
  console.info("[Storage] ✅ Сховище готове.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// ПРОФІЛЬ
// ═══════════════════════════════════════════════════════════════════════════════

export const ProfileService = {
  /** Отримати профіль. */
  get() {
    return _storage.get(STORAGE_KEYS.PROFILE);
  },

  /** Повністю замінити профіль. */
  set(profileData) {
    return _storage.set(STORAGE_KEYS.PROFILE, profileData);
  },

  /** Оновити тільки задані поля (shallow merge). */
  update(partial) {
    const current = this.get();
    return _storage.set(STORAGE_KEYS.PROFILE, { ...current, ...partial });
  },

  /** Оновити вкладений об'єкт dailyGoals. */
  updateGoals(goalsPartial) {
    const current = this.get();
    return _storage.set(STORAGE_KEYS.PROFILE, {
      ...current,
      dailyGoals: { ...current.dailyGoals, ...goalsPartial },
    });
  },

  /** Додати запис ваги у weightHistory. */
  addWeightRecord(weightKg) {
    const current = this.get();
    const record = {
      date: todayISO(),
      weight: weightKg,
    };
    // Якщо за сьогодні вже є запис — перезаписати
    const filtered = current.weightHistory.filter((r) => r.date !== record.date);
    const updated = [...filtered, record].sort((a, b) => a.date.localeCompare(b.date));
    current.weightHistory = updated;
    current.currentWeight = weightKg;
    return _storage.set(STORAGE_KEYS.PROFILE, current);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// БІБЛІОТЕКА ВПРАВ
// ═══════════════════════════════════════════════════════════════════════════════

export const ExerciseService = {
  /** Всі вправи (вбудовані + кастомні). */
  getAll() {
    return _storage.get(STORAGE_KEYS.EXERCISE_LIBRARY) ?? [];
  },

  /** Пошук вправ по назві (регістронезалежно). */
  search(query) {
    const q = query.toLowerCase().trim();
    return this.getAll().filter((ex) => ex.name.toLowerCase().includes(q));
  },

  /** Отримати вправу по id. */
  getById(id) {
    return this.getAll().find((ex) => ex.id === id) ?? null;
  },

  /** Додати кастомну вправу. */
  add({ name, category = "other", equipment = "other" }) {
    const all = this.getAll();
    const newEx = {
      id: `ex_custom_${Date.now()}`,
      name,
      category,
      equipment,
      isCustom: true,
    };
    all.push(newEx);
    _storage.set(STORAGE_KEYS.EXERCISE_LIBRARY, all);
    return newEx;
  },

  /** Видалити кастомну вправу (вбудовані не можна). */
  remove(id) {
    const all = this.getAll();
    const target = all.find((ex) => ex.id === id);
    if (!target) return false;
    if (!target.isCustom) {
      console.warn("[ExerciseService] Неможливо видалити вбудовану вправу.");
      return false;
    }
    _storage.set(
      STORAGE_KEYS.EXERCISE_LIBRARY,
      all.filter((ex) => ex.id !== id)
    );
    return true;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ПРОГРАМИ ТРЕНУВАНЬ
// ═══════════════════════════════════════════════════════════════════════════════

export const ProgramService = {
  getAll() {
    return _storage.get(STORAGE_KEYS.PROGRAMS) ?? [];
  },

  getById(id) {
    return this.getAll().find((p) => p.id === id) ?? null;
  },

  /** Створити нову програму. */
  create(name) {
    const programs = this.getAll();
    const newProgram = {
      id: `prog_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      days: [],
    };
    programs.push(newProgram);
    _storage.set(STORAGE_KEYS.PROGRAMS, programs);
    return newProgram;
  },

  /** Оновити програму (повна заміна). */
  update(updatedProgram) {
    const programs = this.getAll();
    const idx = programs.findIndex((p) => p.id === updatedProgram.id);
    if (idx === -1) return false;
    programs[idx] = updatedProgram;
    return _storage.set(STORAGE_KEYS.PROGRAMS, programs);
  },

  /** Видалити програму. */
  remove(id) {
    const programs = this.getAll().filter((p) => p.id !== id);
    return _storage.set(STORAGE_KEYS.PROGRAMS, programs);
  },

  /** Додати день до програми. */
  addDay(programId, dayName) {
    const program = this.getById(programId);
    if (!program) return null;
    const newDay = {
      id: `day_${Date.now()}`,
      name: dayName,
      exercises: [],
    };
    program.days.push(newDay);
    this.update(program);
    return newDay;
  },

  /** Додати вправу до дня програми. */
  addExerciseToDay(programId, dayId, exerciseConfig) {
    const program = this.getById(programId);
    if (!program) return false;
    const day = program.days.find((d) => d.id === dayId);
    if (!day) return false;
    day.exercises.push({
      exerciseId: exerciseConfig.exerciseId,
      sets: exerciseConfig.sets ?? 3,
      targetReps: exerciseConfig.targetReps ?? "8-12",
      restSeconds: exerciseConfig.restSeconds ?? 90,
      notes: exerciseConfig.notes ?? "",
    });
    return this.update(program);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ЩОДЕННИК ТРЕНУВАНЬ
// ═══════════════════════════════════════════════════════════════════════════════

export const WorkoutLogService = {
  getAll() {
    return _storage.get(STORAGE_KEYS.WORKOUT_LOG) ?? [];
  },

  /** Всі тренування за конкретну дату (YYYY-MM-DD). */
  getByDate(date) {
    return this.getAll().filter((log) => log.date === date);
  },

  /** Тренування за сьогодні. */
  getToday() {
    return this.getByDate(todayISO());
  },

  /** Почати нове тренування (повертає об'єкт сесії). */
  startSession({ programId = null, dayId = null } = {}) {
    const session = {
      id: `log_${Date.now()}`,
      date: todayISO(),
      programId,
      dayId,
      startTime: new Date().toISOString(),
      endTime: null,
      exercises: [],
      totalVolume: 0,
      notes: "",
    };
    const all = this.getAll();
    all.push(session);
    _storage.set(STORAGE_KEYS.WORKOUT_LOG, all);
    return session;
  },

  /** Зберегти / оновити сесію. */
  updateSession(updatedSession) {
    // Перерахувати totalVolume
    updatedSession.totalVolume = updatedSession.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0)
      );
    }, 0);

    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === updatedSession.id);
    if (idx === -1) return false;
    all[idx] = updatedSession;
    return _storage.set(STORAGE_KEYS.WORKOUT_LOG, all);
  },

  /** Завершити сесію (зафіксувати endTime). */
  finishSession(sessionId) {
    const all = this.getAll();
    const session = all.find((s) => s.id === sessionId);
    if (!session) return false;
    session.endTime = new Date().toISOString();
    return _storage.set(STORAGE_KEYS.WORKOUT_LOG, all);
  },

  /** Додати підхід до вправи в сесії. */
  addSet(sessionId, exerciseId, setData) {
    const all = this.getAll();
    const session = all.find((s) => s.id === sessionId);
    if (!session) return false;

    let exEntry = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exEntry) {
      exEntry = { exerciseId, sets: [] };
      session.exercises.push(exEntry);
    }

    exEntry.sets.push({
      setNumber: exEntry.sets.length + 1,
      weight: setData.weight,
      reps: setData.reps,
      completed: true,
      timestamp: new Date().toISOString(),
    });

    // Оновити totalVolume
    session.totalVolume = session.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0)
      );
    }, 0);

    return _storage.set(STORAGE_KEYS.WORKOUT_LOG, all);
  },

  /** Максимальна вага для конкретної вправи (для графіків). */
  getExerciseHistory(exerciseId) {
    return this.getAll()
      .filter((log) =>
        log.exercises.some((ex) => ex.exerciseId === exerciseId)
      )
      .map((log) => {
        const exEntry = log.exercises.find((ex) => ex.exerciseId === exerciseId);
        const maxWeight = Math.max(...exEntry.sets.map((s) => s.weight ?? 0));
        return { date: log.date, maxWeight };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// БАЗА ПРОДУКТІВ
// ═══════════════════════════════════════════════════════════════════════════════

export const FoodService = {
  /** Всі продукти: вбудовані + кастомні. */
  getAll() {
    const custom = _storage.get(STORAGE_KEYS.FOOD_DB_CUSTOM) ?? [];
    return [...FOOD_DATABASE, ...custom];
  },

  /** Пошук по назві. */
  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter((f) => f.name.toLowerCase().includes(q));
  },

  /** Отримати продукт по id. */
  getById(id) {
    return this.getAll().find((f) => f.id === id) ?? null;
  },

  /** Підрахувати КБЖУ для порції. */
  calculatePortion(foodId, grams) {
    const food = this.getById(foodId);
    if (!food) return null;
    const ratio = grams / 100;
    return {
      calories: round(food.per100g.calories * ratio),
      protein: round(food.per100g.protein * ratio),
      fat: round(food.per100g.fat * ratio),
      carbs: round(food.per100g.carbs * ratio),
    };
  },

  /** Додати кастомний продукт. */
  addCustom({ name, category = "other", calories, protein, fat, carbs }) {
    const custom = _storage.get(STORAGE_KEYS.FOOD_DB_CUSTOM) ?? [];
    const newFood = {
      id: `food_custom_${Date.now()}`,
      name,
      category,
      unit: "100g",
      per100g: {
        calories: Number(calories),
        protein: Number(protein),
        fat: Number(fat),
        carbs: Number(carbs),
      },
      isCustom: true,
    };
    custom.push(newFood);
    _storage.set(STORAGE_KEYS.FOOD_DB_CUSTOM, custom);
    return newFood;
  },

  /** Видалити кастомний продукт. */
  removeCustom(id) {
    const custom = _storage.get(STORAGE_KEYS.FOOD_DB_CUSTOM) ?? [];
    if (!custom.find((f) => f.id === id)) return false;
    _storage.set(
      STORAGE_KEYS.FOOD_DB_CUSTOM,
      custom.filter((f) => f.id !== id)
    );
    return true;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ЩОДЕННИК ХАРЧУВАННЯ
// ═══════════════════════════════════════════════════════════════════════════════

/** Типи прийомів їжі */
export const MEAL_TYPES = Object.freeze(["breakfast", "lunch", "dinner", "snacks"]);

export const NutritionService = {
  getAll() {
    return _storage.get(STORAGE_KEYS.NUTRITION_LOG) ?? [];
  },

  /** Запис за конкретну дату. Створює, якщо немає. */
  getDayLog(date = todayISO()) {
    const all = this.getAll();
    let dayLog = all.find((d) => d.date === date);
    if (!dayLog) {
      dayLog = this._createEmptyDay(date);
      all.push(dayLog);
      _storage.set(STORAGE_KEYS.NUTRITION_LOG, all);
    }
    return dayLog;
  },

  /** Запис за сьогодні. */
  getToday() {
    return this.getDayLog(todayISO());
  },

  /** Додати продукт у прийом їжі. */
  addEntry(foodId, grams, mealType = "snacks", date = todayISO()) {
    if (!MEAL_TYPES.includes(mealType)) {
      console.error(`[NutritionService] Невідомий тип прийому їжі: ${mealType}`);
      return false;
    }

    const food = FoodService.getById(foodId);
    if (!food) return false;

    const macros = FoodService.calculatePortion(foodId, grams);
    const entry = {
      id: `entry_${Date.now()}`,
      foodId,
      foodName: food.name,
      grams,
      calculated: macros,
    };

    const all = this.getAll();
    let dayLog = all.find((d) => d.date === date);
    if (!dayLog) {
      dayLog = this._createEmptyDay(date);
      all.push(dayLog);
    }

    dayLog.meals[mealType].push(entry);
    dayLog.totals = this._calcTotals(dayLog.meals);

    _storage.set(STORAGE_KEYS.NUTRITION_LOG, all);
    return entry;
  },

  /** Видалити запис з прийому їжі. */
  removeEntry(entryId, mealType, date = todayISO()) {
    const all = this.getAll();
    const dayLog = all.find((d) => d.date === date);
    if (!dayLog) return false;

    dayLog.meals[mealType] = dayLog.meals[mealType].filter(
      (e) => e.id !== entryId
    );
    dayLog.totals = this._calcTotals(dayLog.meals);

    return _storage.set(STORAGE_KEYS.NUTRITION_LOG, all);
  },

  /** Підсумки (totals) за конкретну дату. */
  getTotals(date = todayISO()) {
    return this.getDayLog(date).totals;
  },

  /** Чи досягнута норма білка за сьогодні? */
  isProteinGoalMet() {
    const totals = this.getTotals();
    const goal = ProfileService.get()?.dailyGoals?.protein ?? 0;
    return goal > 0 && totals.protein >= goal;
  },

  // ── приватне ──
  _createEmptyDay(date) {
    return {
      date,
      meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    };
  },

  _calcTotals(meals) {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    MEAL_TYPES.forEach((mealType) => {
      meals[mealType].forEach((entry) => {
        totals.calories += entry.calculated.calories;
        totals.protein += entry.calculated.protein;
        totals.fat += entry.calculated.fat;
        totals.carbs += entry.calculated.carbs;
      });
    });
    return {
      calories: round(totals.calories),
      protein: round(totals.protein),
      fat: round(totals.fat),
      carbs: round(totals.carbs),
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ТРЕКЕР ВОДИ
// ═══════════════════════════════════════════════════════════════════════════════

const GLASS_ML = 250;

export const WaterService = {
  getAll() {
    return _storage.get(STORAGE_KEYS.WATER_LOG) ?? [];
  },

  /** Запис за дату. */
  getByDate(date = todayISO()) {
    const all = this.getAll();
    return all.find((d) => d.date === date) ?? this._emptyDay(date);
  },

  getToday() {
    return this.getByDate(todayISO());
  },

  /** Додати одну склянку (250 мл). */
  addGlass(date = todayISO()) {
    const all = this.getAll();
    let day = all.find((d) => d.date === date);
    if (!day) {
      day = this._emptyDay(date);
      all.push(day);
    }
    day.glasses += 1;
    day.totalMl += GLASS_ML;
    day.history.push(new Date().toTimeString().slice(0, 5));
    _storage.set(STORAGE_KEYS.WATER_LOG, all);
    return day;
  },

  /** Прибрати останню склянку. */
  removeGlass(date = todayISO()) {
    const all = this.getAll();
    const day = all.find((d) => d.date === date);
    if (!day || day.glasses === 0) return false;
    day.glasses -= 1;
    day.totalMl -= GLASS_ML;
    day.history.pop();
    return _storage.set(STORAGE_KEYS.WATER_LOG, all);
  },

  /** Прогрес: 0–100 %. */
  getProgressPercent(date = todayISO()) {
    const goal = ProfileService.get()?.dailyGoals?.water ?? 2000;
    const day = this.getByDate(date);
    return Math.min(100, Math.round((day.totalMl / goal) * 100));
  },

  _emptyDay(date) {
    return { date, glasses: 0, totalMl: 0, history: [] };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// АЧІВКИ
// ═══════════════════════════════════════════════════════════════════════════════

export const ACHIEVEMENT_DEFS = [
  {
    id: "first_workout",
    title: "Перший крок",
    desc: "Заверши своє перше тренування",
    icon: "🏋️",
  },
  {
    id: "streak_3",
    title: "3 дні поспіль",
    desc: "Тренуйся 3 дні підряд",
    icon: "🔥",
  },
  {
    id: "streak_7",
    title: "Тижневий марафон",
    desc: "Тренуйся 7 днів підряд",
    icon: "⚡",
  },
  {
    id: "protein_goal",
    title: "Білковий рекорд",
    desc: "Закрий норму білка за день",
    icon: "💪",
  },
  {
    id: "water_goal",
    title: "Гідрований",
    desc: "Випий денну норму води",
    icon: "💧",
  },
  {
    id: "log_5_workouts",
    title: "Регулярність",
    desc: "Залогуй 5 тренувань",
    icon: "📓",
  },
];

export const AchievementService = {
  getData() {
    return _storage.get(STORAGE_KEYS.ACHIEVEMENTS);
  },

  /** Перевірити та видати нові ачівки. Повертає масив нових. */
  check() {
    const data = this.getData();
    const newlyUnlocked = [];

    const tryUnlock = (id) => {
      if (!data.unlocked.includes(id)) {
        data.unlocked.push(id);
        data.checks[id] = { unlockedAt: todayISO() };
        newlyUnlocked.push(id);
      }
    };

    // Перше тренування
    if (WorkoutLogService.getAll().length >= 1) tryUnlock("first_workout");

    // 5 тренувань
    if (WorkoutLogService.getAll().length >= 5) tryUnlock("log_5_workouts");

    // Стрік
    this._updateStreak(data);
    if (data.streakDays >= 3) tryUnlock("streak_3");
    if (data.streakDays >= 7) tryUnlock("streak_7");

    // Норма білка
    if (NutritionService.isProteinGoalMet()) tryUnlock("protein_goal");

    // Норма води
    if (WaterService.getProgressPercent() >= 100) tryUnlock("water_goal");

    _storage.set(STORAGE_KEYS.ACHIEVEMENTS, data);
    return newlyUnlocked;
  },

  isUnlocked(id) {
    return this.getData().unlocked.includes(id);
  },

  // ── приватне ──
  _updateStreak(data) {
    const today = todayISO();
    const yesterday = offsetDate(-1);
    if (data.lastWorkoutDate === yesterday) {
      const todayHasWorkout = WorkoutLogService.getByDate(today).length > 0;
      if (todayHasWorkout) {
        data.streakDays += 1;
        data.lastWorkoutDate = today;
      }
    } else if (data.lastWorkoutDate !== today) {
      const todayHasWorkout = WorkoutLogService.getByDate(today).length > 0;
      if (todayHasWorkout) {
        data.streakDays = 1;
        data.lastWorkoutDate = today;
      } else {
        data.streakDays = 0;
      }
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// УТИЛІТИ
// ═══════════════════════════════════════════════════════════════════════════════

/** Сьогоднішня дата у форматі YYYY-MM-DD. */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Дата зі зсувом на N днів від сьогодні. */
function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Округлення до 1 десяткового знаку. */
function round(n) {
  return Math.round(n * 10) / 10;
}

/** Повністю скинути всі дані (для розробки). */
export function resetAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => _storage.remove(key));
  initStorage();
  console.warn("[Storage] ⚠️ Всі дані скинуто.");
}
