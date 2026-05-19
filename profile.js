/**
 * profile.js
 * Модуль профілю користувача
 *
 * Керує: ім'я, вага, ціль, денна норма КБЖУ, графік ваги
 */

import { ProfileService, todayISO } from "../core/storage.js";
import { EventBus, EVENT_TYPES } from "../core/eventBus.js";
import { getSectionContainer } from "../core/router.js";

export function initProfileModule() {
  console.info("[Profile] ✅ Модуль профілю ініціалізовано");

  // Слухати зміну маршруту
  EventBus.on(EVENT_TYPES.ROUTE_CHANGED, (data) => {
    if (data.route === "profile") {
      renderProfilePage();
    }
  });

  // Слухати оновлення профілю з інших модулів
  EventBus.on(EVENT_TYPES.USER_PROFILE_UPDATED, () => {
    renderProfilePage();
  });
}

/**
 * Рендеринг сторінки профілю
 */
function renderProfilePage() {
  const container = getSectionContainer("profile");
  if (!container) return;

  const profile = ProfileService.get();

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Заголовок -->
      <div>
        <h1 class="text-4xl font-bold text-accent mb-2">Твій Профіль</h1>
        <p class="text-muted">Управління персональними даними та цілями</p>
      </div>

      <!-- Основна інформація (3 колонки) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Поточна вага -->
        <div class="card card-highlight">
          <h3 class="text-sm text-muted mb-2">Поточна вага</h3>
          <p class="text-4xl font-bold text-accent">
            ${profile.currentWeight ? profile.currentWeight.toFixed(1) : "–"}
          </p>
          <p class="text-xs text-muted mt-2">кг</p>
        </div>

        <!-- Цільова вага -->
        <div class="card">
          <h3 class="text-sm text-muted mb-2">Ціль</h3>
          <p class="text-4xl font-bold text-accent-yellow">
            ${profile.targetWeight ? profile.targetWeight.toFixed(1) : "–"}
          </p>
          <p class="text-xs text-muted mt-2">кг</p>
        </div>

        <!-- Різниця -->
        <div class="card">
          <h3 class="text-sm text-muted mb-2">Залишилося</h3>
          <p class="text-4xl font-bold">
            ${profile.currentWeight && profile.targetWeight
              ? (profile.currentWeight - profile.targetWeight).toFixed(1)
              : "–"
            }
          </p>
          <p class="text-xs text-muted mt-2">кг</p>
        </div>
      </div>

      <!-- Форма редагування -->
      <div class="card">
        <h2 class="text-2xl font-bold mb-6">Редагувати профіль</h2>

        <form id="profile-form" class="space-y-4">
          <!-- Ім'я -->
          <div>
            <label class="block text-sm text-muted mb-2">Ім'я</label>
            <input
              type="text"
              id="name-input"
              value="${profile.name || ""}"
              placeholder="Твоє ім'я"
            />
          </div>

          <!-- Вік -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-muted mb-2">Вік</label>
              <input
                type="number"
                id="age-input"
                value="${profile.age || ""}"
                placeholder="20"
                min="1"
                max="120"
              />
            </div>

            <!-- Стать -->
            <div>
              <label class="block text-sm text-muted mb-2">Стать</label>
              <select id="gender-select">
                <option value="male" ${profile.gender === "male" ? "selected" : ""}>Чоловік</option>
                <option value="female" ${profile.gender === "female" ? "selected" : ""}>Жінка</option>
              </select>
            </div>
          </div>

          <!-- Зріст -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-muted mb-2">Зріст (см)</label>
              <input
                type="number"
                id="height-input"
                value="${profile.height || ""}"
                placeholder="180"
                min="50"
                max="300"
              />
            </div>

            <!-- Поточна вага (редагування) -->
            <div>
              <label class="block text-sm text-muted mb-2">Поточна вага (кг)</label>
              <input
                type="number"
                id="current-weight-input"
                value="${profile.currentWeight || ""}"
                placeholder="80"
                min="20"
                max="500"
                step="0.1"
              />
            </div>
          </div>

          <!-- Цільова вага -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-muted mb-2">Цільова вага (кг)</label>
              <input
                type="number"
                id="target-weight-input"
                value="${profile.targetWeight || ""}"
                placeholder="75"
                min="20"
                max="500"
                step="0.1"
              />
            </div>

            <!-- Ціль -->
            <div>
              <label class="block text-sm text-muted mb-2">Ціль</label>
              <select id="goal-select">
                <option value="loss" ${profile.goal === "loss" ? "selected" : ""}>Схуднення</option>
                <option value="gain" ${profile.goal === "gain" ? "selected" : ""}>Набір маси</option>
                <option value="maintain" ${profile.goal === "maintain" ? "selected" : ""}>Підтримання</option>
              </select>
            </div>
          </div>

          <!-- Рівень активності -->
          <div>
            <label class="block text-sm text-muted mb-2">Рівень активності</label>
            <select id="activity-level-select">
              <option value="sedentary" ${profile.activityLevel === "sedentary" ? "selected" : ""}>Сидячий</option>
              <option value="light" ${profile.activityLevel === "light" ? "selected" : ""}>Легкий (1-3 дні на тиждень)</option>
              <option value="moderate" ${profile.activityLevel === "moderate" ? "selected" : ""}>Помірний (3-5 днів на тиждень)</option>
              <option value="active" ${profile.activityLevel === "active" ? "selected" : ""}>Активний (6-7 днів на тиждень)</option>
            </select>
          </div>

          <!-- Кнопка збереження -->
          <button type="submit" class="btn btn-primary w-full mt-6">
            💾 Зберегти профіль
          </button>
        </form>
      </div>

      <!-- Денні норми КБЖУ -->
      <div class="card">
        <h2 class="text-2xl font-bold mb-6">Денні норми</h2>

        <form id="goals-form" class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-muted mb-2">Калорійність</label>
              <input
                type="number"
                id="calories-input"
                value="${profile.dailyGoals.calories}"
                min="500"
                max="5000"
              />
              <p class="text-xs text-muted mt-1">ккал</p>
            </div>

            <div>
              <label class="block text-sm text-muted mb-2">Білки</label>
              <input
                type="number"
                id="protein-input"
                value="${profile.dailyGoals.protein}"
                min="10"
                max="500"
              />
              <p class="text-xs text-muted mt-1">г</p>
            </div>

            <div>
              <label class="block text-sm text-muted mb-2">Жири</label>
              <input
                type="number"
                id="fat-input"
                value="${profile.dailyGoals.fat}"
                min="10"
                max="300"
              />
              <p class="text-xs text-muted mt-1">г</p>
            </div>

            <div>
              <label class="block text-sm text-muted mb-2">Вуглеводи</label>
              <input
                type="number"
                id="carbs-input"
                value="${profile.dailyGoals.carbs}"
                min="10"
                max="1000"
              />
              <p class="text-xs text-muted mt-1">г</p>
            </div>
          </div>

          <div>
            <label class="block text-sm text-muted mb-2">Вода</label>
            <input
              type="number"
              id="water-input"
              value="${profile.dailyGoals.water}"
              min="500"
              max="10000"
            />
            <p class="text-xs text-muted mt-1">мл</p>
          </div>

          <button type="submit" class="btn btn-primary w-full">
            💾 Зберегти норми
          </button>
        </form>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById("profile-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById("name-input").value,
      age: parseInt(document.getElementById("age-input").value) || null,
      gender: document.getElementById("gender-select").value,
      height: parseInt(document.getElementById("height-input").value) || null,
      currentWeight: parseFloat(document.getElementById("current-weight-input").value) || null,
      targetWeight: parseFloat(document.getElementById("target-weight-input").value) || null,
      goal: document.getElementById("goal-select").value,
      activityLevel: document.getElementById("activity-level-select").value,
    };
    ProfileService.update(updated);
    EventBus.emit(EVENT_TYPES.USER_PROFILE_UPDATED, updated);
    alert("✅ Профіль оновлено!");
  });

  document.getElementById("goals-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const goalsUpdate = {
      calories: parseInt(document.getElementById("calories-input").value),
      protein: parseInt(document.getElementById("protein-input").value),
      fat: parseInt(document.getElementById("fat-input").value),
      carbs: parseInt(document.getElementById("carbs-input").value),
      water: parseInt(document.getElementById("water-input").value),
    };
    ProfileService.updateGoals(goalsUpdate);
    EventBus.emit(EVENT_TYPES.USER_PROFILE_UPDATED, { dailyGoals: goalsUpdate });
    alert("✅ Норми оновлено!");
  });
}
