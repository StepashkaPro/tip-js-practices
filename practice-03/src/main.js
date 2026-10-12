"use strict";

import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
  renderTaskList,
  renderSummary,
  renderEmptyState,
} from "./task-view.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  priorityFilters: document.querySelector("#priority-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
};

const isVariant =
  new URLSearchParams(window.location.search).get("dataset") === "variant";
const initialTasks = isVariant ? variantTasks : demoTasks;

let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";
let currentPriority = "all";

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

// Фильтр по приоритету (дополнительное задание)
function filterByPriority(tasks, priority) {
  if (priority === "all") return tasks;
  return tasks.filter((task) => task.priority === priority);
}

function renderApp() {
  const visibleByStatus = getVisibleTasks(currentTasks, currentFilter);
  const visibleTasks = filterByPriority(visibleByStatus, currentPriority);

  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  // Обновляем активный фильтр по статусу
  for (const button of elements.filters.querySelectorAll("button[data-filter]")) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }

  // Обновляем активный фильтр по приоритету
  for (const button of elements.priorityFilters.querySelectorAll("button[data-priority]")) {
    const isActive = button.dataset.priority === currentPriority;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-action]");
  if (!button || !elements.list.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") return;

  const card = button.closest("[data-task-id]");
  if (!card) return;

  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    elements.message.textContent = "Ошибка: некорректный идентификатор задачи.";
    return;
  }

  let result;
  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (!task) {
      elements.message.textContent = "Ошибка: задача не найдена.";
      return;
    }
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result.ok) {
    elements.message.textContent = `Ошибка: ${result.error}`;
    return;
  }

  currentTasks = result.tasks;
  elements.message.textContent = "";
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-filter]");
  if (!button || !elements.filters.contains(button)) return;

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") return;

  currentFilter = filter;
  elements.message.textContent = "";
  renderApp();
}

// Дополнительное задание: обработчик фильтра по приоритету
function handlePriorityClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-priority]");
  if (!button || !elements.priorityFilters.contains(button)) return;

  const priority = button.dataset.priority;
  if (!["all", "low", "medium", "high"].includes(priority)) return;

  currentPriority = priority;
  elements.message.textContent = "";
  renderApp();
}

function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`
  );
  const filterButton = elements.filters.querySelector(
    `button[data-filter="${currentFilter}"]`
  );
  (actionButton ?? filterButton)?.focus();
}

elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);
elements.priorityFilters.addEventListener("click", handlePriorityClick);

try {
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}