import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
  addTask,
  findTaskById,
  removeTask,
  setTaskCompleted,
  updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
  renderEmptyState,
  renderSummary,
  renderTaskList,
} from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
  storageStatus: document.querySelector("#storage-status"),
  form: document.querySelector("#task-form"),
  formHeading: document.querySelector("#form-heading"),
  formMode: document.querySelector("#form-mode"),
  formMessage: document.querySelector("#form-message"),
  idInput: document.querySelector("#task-id"),
  titleInput: document.querySelector("#task-title"),
  priorityInput: document.querySelector("#task-priority"),
  submitButton: document.querySelector("#form-submit"),
  cancelButton: document.querySelector("#cancel-edit"),
  resetButton: document.querySelector("#reset-data"),
};

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";
const isCheckRun = params.get("mode") === "check";
const initialTasks = isVariant ? variantTasks : demoTasks;
const datasetName = isVariant ? "variant" : "demo";
const storageKey = isCheckRun
  ? `tip-js-practice-04:checks:${datasetName}`
  : `tip-js-practice-04:${datasetName}`;

// Готовая граница запуска: даже незавершённый или ошибочный модуль хранилища
// не должен оставлять страницу без диагностического сообщения.
let loaded;
try {
  loaded = loadTasks(window.localStorage, storageKey, initialTasks);
} catch (error) {
  loaded = {
    ok: false,
    source: "fallback",
    tasks: initialTasks.map((task) => ({ ...task })),
    error: `Хранилище не инициализировано: ${error.message}`,
  };
  console.error(error);
}
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

if (loaded.source === "storage") {
  elements.storageStatus.textContent = "Данные восстановлены из localStorage.";
} else if (loaded.ok) {
  elements.storageStatus.textContent =
    "Используется исходный набор; сохранённых данных пока нет.";
} else {
  elements.storageStatus.textContent = loaded.error;
  elements.storageStatus.classList.add("is-warning");
}

function renderApp() {
  const visible = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(elements.list, visible);
  renderSummary(elements.summary, currentTasks, visible.length);
  renderEmptyState(elements.empty, currentTasks.length, visible.length);
  for (const b of elements.filters.querySelectorAll("[data-filter]")) {
    b.setAttribute("aria-pressed", String(b.dataset.filter === currentFilter));
    b.classList.toggle("is-active", b.dataset.filter === currentFilter);
  }
}

function clearFieldError(name) {
  const input = elements.form.elements.namedItem(name);
  const message = elements.form.querySelector(`[data-error-for="${name}"]`);
  if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  }
  if (message) message.textContent = "";
}

function clearFormErrors() {
  for (const name of ["id", "title", "priority"]) clearFieldError(name);
  elements.formMessage.textContent = "";
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const [name, text] of Object.entries(errors)) {
    const input = elements.form.elements.namedItem(name);
    const message = elements.form.querySelector(`[data-error-for="${name}"]`);
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLSelectElement
    ) {
      input.setCustomValidity(text);
      input.setAttribute("aria-invalid", "true");
    }
    if (message) message.textContent = text;
  }
  elements.form.reportValidity();
}

function setFormMode(id = null) {
  const task = id === null ? null : findTaskById(currentTasks, id);
  if (id !== null && !task) {
    elements.message.textContent = "Задача отсутствует.";
    return;
  }
  editingId = id;
  clearFormErrors();
  elements.form.reset();
  elements.idInput.disabled = id !== null;
  elements.idInput.value = task?.id ?? "";
  elements.titleInput.value = task?.title ?? "";
  elements.priorityInput.value = task?.priority ?? "medium";
  elements.formHeading.textContent = task
    ? "Редактирование задачи"
    : "Добавление задачи";
  elements.formMode.textContent = task
    ? `Изменяется задача № ${id}`
    : "Создание новой задачи";
  elements.submitButton.textContent = task
    ? "Сохранить изменения"
    : "Добавить задачу";
  elements.cancelButton.hidden = !task;
}

function persistCurrentTasks(successMessage) {
  const saved = saveTasks(window.localStorage, storageKey, currentTasks);
  elements.storageStatus.classList.toggle("is-warning", !saved.ok);
  elements.storageStatus.textContent = saved.ok
    ? "Изменения сохранены в localStorage."
    : saved.error;
  elements.message.textContent = saved.ok
    ? successMessage
    : `${successMessage} ${saved.error}`;
  renderApp();
  return saved;
}

// Готовая вспомогательная функция из логики ПР3. После полной перерисовки
// возвращает фокус на действие той же задачи либо на активный фильтр.
function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(
    `[data-filter="${currentFilter}"]`,
  );
  (actionButton ?? filterButton)?.focus();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const r = validateTaskDraft(
    {
      id: elements.idInput.value,
      title: elements.titleInput.value,
      priority: elements.priorityInput.value,
    },
    currentTasks,
    editingId,
  );
  if (!r.ok) {
    showFormErrors(r.errors);
    return;
  }
  const { id, title, priority } = r.value;
  const result =
    editingId === null
      ? addTask(currentTasks, id, title, priority)
      : updateTask(currentTasks, id, title, priority);
  if (!result.ok) {
    elements.formMessage.textContent = result.error;
    return;
  }
  currentTasks = result.tasks;
  setFormMode();
  persistCurrentTasks("Задача сохранена.");
}

function handleTaskListClick(event) {
  const b = event.target.closest("button[data-action]");
  const item = b?.closest("[data-task-id]");
  if (!item || !elements.list.contains(b)) return;
  const id = Number(item.dataset.taskId),
    action = b.dataset.action;
  const task = findTaskById(currentTasks, id);
  if (!task) return;
  if (action === "edit") {
    setFormMode(id);
    return;
  }
  const r =
    action === "toggle"
      ? setTaskCompleted(currentTasks, id, !task.completed)
      : action === "delete"
        ? removeTask(currentTasks, id)
        : null;
  if (r?.ok) {
    currentTasks = r.tasks;
    if (editingId === id && action === "delete") setFormMode();
    persistCurrentTasks("Список обновлён.");
    restoreTaskFocus(id, action);
  }
}

function handleFilterClick(event) {
  const b = event.target.closest("[data-filter]");
  if (!b || !elements.filters.contains(b)) return;
  currentFilter = b.dataset.filter;
  renderApp();
}

function handleResetClick() {
  const r = removeSavedTasks(window.localStorage, storageKey);
  currentTasks = initialTasks.map((t) => ({ ...t }));
  currentFilter = "all";
  setFormMode();
  elements.storageStatus.textContent = r.ok
    ? "Используется исходный набор."
    : r.error;
  elements.storageStatus.classList.toggle("is-warning", !r.ok);
  renderApp();
}

elements.form.addEventListener("submit", handleFormSubmit);
elements.form.addEventListener("input", (event) => {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement
  ) {
    clearFieldError(event.target.name);
  }
});
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);
elements.cancelButton.addEventListener("click", () => setFormMode());
elements.resetButton.addEventListener("click", handleResetClick);

try {
  setFormMode();
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
