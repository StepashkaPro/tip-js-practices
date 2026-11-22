export const STORAGE_VERSION = 1;
const copy = (tasks) => tasks.map((t) => ({ ...t }));
export function isValidTaskList(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (t) =>
        t &&
        Number.isSafeInteger(t.id) &&
        t.id > 0 &&
        typeof t.title === "string" &&
        t.title.trim().length > 0 &&
        t.title.trim().length <= 100 &&
        typeof t.completed === "boolean" &&
        ["low", "medium", "high"].includes(t.priority),
    ) &&
    new Set(value.map((t) => t.id)).size === value.length
  );
}
export function loadTasks(storage, key, fallbackTasks) {
  try {
    const raw = storage.getItem(key);
    if (raw === null)
      return { ok: true, source: "initial", tasks: copy(fallbackTasks) };
    const data = JSON.parse(raw);
    if (data?.version !== STORAGE_VERSION || !isValidTaskList(data.tasks))
      throw new Error("Неверная схема сохранённых данных");
    return { ok: true, source: "storage", tasks: copy(data.tasks) };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: copy(fallbackTasks),
      error: "Не удалось загрузить данные: " + error.message,
    };
  }
}
export function saveTasks(storage, key, tasks) {
  try {
    if (!isValidTaskList(tasks)) throw new Error("Неверный список задач");
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: "Не удалось сохранить данные: " + error.message,
    };
  }
}
export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось удалить данные: " + error.message };
  }
}
