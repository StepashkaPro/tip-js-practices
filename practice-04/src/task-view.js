import { getTaskStats } from "./task-service.js";

const labels = { low: "Низкий", medium: "Средний", high: "Высокий" };
export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = "task-card";
  li.classList.toggle("is-completed", task.completed);
  li.dataset.taskId = task.id;
  for (const [tag, cls, text] of [
    ["h3", "task-title", task.title],
    ["span", "task-status", task.completed ? "Выполнена" : "В работе"],
    ["span", "task-priority", labels[task.priority]],
  ]) {
    const n = document.createElement(tag);
    n.className = cls;
    n.textContent = text;
    li.append(n);
  }
  if (category) {
    const n = document.createElement("span");
    n.className = "task-category";
    n.textContent = category.name;
    li.append(n);
  }
  for (const [action, text] of [
    ["toggle", task.completed ? "Вернуть в работу" : "Завершить"],
    ["edit", "Изменить"],
    ["delete", "Удалить"],
  ]) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.action = action;
    const s = document.createElement("span");
    s.className = "action-label";
    s.textContent = text;
    b.append(s);
    li.append(b);
  }
  return li;
}
export function renderTaskList(list, tasks, categories = []) {
  list.replaceChildren(
    ...tasks.map((t) =>
      createTaskElement(
        t,
        categories.find((c) => c.id === t.categoryId),
      ),
    ),
  );
}

export function renderSummary(el, tasks, visibleCount) {
  const s = getTaskStats(tasks);
  for (const [k, v] of Object.entries({ ...s, visible: visibleCount })) {
    const n = el.querySelector(`[data-stat="${k}"]`);
    if (n) n.textContent = k === "progress" ? v.toFixed(1) + "%" : String(v);
  }
}
export function renderEmptyState(el, total, visibleCount) {
  el.hidden = visibleCount > 0;
  el.textContent = visibleCount
    ? ""
    : total
      ? "Нет задач по выбранному фильтру."
      : "Список задач пуст.";
}
