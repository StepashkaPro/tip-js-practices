"use strict";

const PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 100;
const MAX_TASKS = 1000;


function validateId(id) {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  return { ok: true };
}

function validateTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const cleaned = title.trim();
  if (cleaned.length < 1 || cleaned.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Название должно содержать от 1 до ${MAX_TITLE_LENGTH} символов` };
  }
  return { ok: true, title: cleaned };
}

function validatePriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    return { ok: false, error: 'Приоритет должен быть "low", "medium" или "high"' };
  }
  return { ok: true };
}


export function createTask(id, title, priority = "medium") {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const priorityCheck = validatePriority(priority);
  if (!priorityCheck.ok) return priorityCheck;

  return {
    ok: true,
    task: {
      id,
      title: titleCheck.title,
      completed: false,
      priority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;
  for (const task of tasks) {
    if (task.completed === true) completed += 1;
  }
  const pending = total - completed;
  const progress = total > 0 ? completed / total * 100 : 0;
  return { total, completed, pending, progress };
}


export function addTask(tasks, id, title, priority = "medium") {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  if (tasks.some((task) => task.id === id)) {
    return { ok: false, error: "Задача с таким id уже существует" };
  }

  const created = createTask(id, title, priority);
  if (!created.ok) return created;

  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть логическим значением" };
  }

  const target = tasks.find((task) => task.id === id);
  if (target === undefined) {
    return { ok: false, error: "Задача с таким id не найдена" };
  }

  const next = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task
  );
  return { ok: true, tasks: next };
}

export function renameTask(tasks, id, title) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const target = tasks.find((task) => task.id === id);
  if (target === undefined) {
    return { ok: false, error: "Задача с таким id не найдена" };
  }

  const next = tasks.map((task) =>
    task.id === id ? { ...task, title: titleCheck.title } : task
  );
  return { ok: true, tasks: next };
}

export function removeTask(tasks, id) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const target = tasks.find((task) => task.id === id);
  if (target === undefined) {
    return { ok: false, error: "Задача с таким id не найдена" };
  }

  const next = tasks.filter((task) => task.id !== id);
  return { ok: true, tasks: next };
}