const validId = (id) => Number.isSafeInteger(id) && id > 0;
const fail = () => ({
  ok: false,
  error: "Некорректные данные или задача отсутствует.",
});
export function createTask(id, title, priority = "medium") {
  if (
    !validId(id) ||
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100 ||
    !["low", "medium", "high"].includes(priority)
  )
    return fail();
  return {
    ok: true,
    task: { id, title: title.trim(), completed: false, priority },
  };
}
export const findTaskById = (tasks, id) => tasks.find((t) => t.id === id);
export const getPendingTasks = (tasks) => tasks.filter((t) => !t.completed);
export const getTaskTitles = (tasks) => tasks.map((t) => t.title);
export function getTaskStats(tasks) {
  const total = tasks.length,
    completed = tasks.filter((t) => t.completed).length;
  return {
    total,
    completed,
    pending: total - completed,
    progress: total ? (completed / total) * 100 : 0,
  };
}
export function addTask(tasks, id, title, priority = "medium") {
  const r = createTask(id, title, priority);
  return !r.ok || findTaskById(tasks, id)
    ? fail()
    : { ok: true, tasks: [...tasks, r.task] };
}
function change(tasks, id, fields) {
  if (!validId(id) || !findTaskById(tasks, id)) return fail();
  return {
    ok: true,
    tasks: tasks.map((t) => (t.id === id ? { ...t, ...fields } : t)),
  };
}
export function setTaskCompleted(tasks, id, completed) {
  return typeof completed === "boolean"
    ? change(tasks, id, { completed })
    : fail();
}
export function updateTask(tasks, id, title, priority) {
  const r = createTask(id, title, priority);
  return r.ok
    ? change(tasks, id, { title: r.task.title, priority: r.task.priority })
    : fail();
}
export function renameTask(tasks, id, title) {
  return updateTask(tasks, id, title, findTaskById(tasks, id)?.priority);
}
export function removeTask(tasks, id) {
  return validId(id) && findTaskById(tasks, id)
    ? { ok: true, tasks: tasks.filter((t) => t.id !== id) }
    : fail();
}
