"use strict";

/**
 * Возвращает новый массив задач по выбранному фильтру.
 * @param {Array} tasks — корректный массив задач.
 * @param {string} filter — "all", "pending" или "completed".
 * @returns {Array} — новый массив.
 */
export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") {
    return tasks.filter((task) => task.completed === false);
  }
  if (filter === "completed") {
    return tasks.filter((task) => task.completed === true);
  }
  // "all" или неизвестное значение → копия всех задач
  return [...tasks];
}