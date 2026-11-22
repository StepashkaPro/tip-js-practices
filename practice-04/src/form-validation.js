export function validateTaskDraft(draft, tasks, editingId = null) {
  const id = editingId === null ? Number(draft.id) : editingId;
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  const priority = draft.priority,
    errors = {};
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    (editingId === null
      ? tasks.some((t) => t.id === id)
      : !tasks.some((t) => t.id === id))
  )
    errors.id =
      "Укажите уникальный положительный целый id существующей или новой задачи.";
  if (!title || title.length > 100)
    errors.title = "Название должно содержать от 1 до 100 символов.";
  if (!["low", "medium", "high"].includes(priority))
    errors.priority = "Выберите допустимый приоритет.";
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value: { id, title, priority } };
}
