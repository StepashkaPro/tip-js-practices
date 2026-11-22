export function validateTaskDraft(draft, categories) {
  const title = typeof draft.title === "string" ? draft.title.trim() : "",
    priority = draft.priority,
    categoryId = Number(draft.categoryId),
    errors = {};
  if (!title || title.length > 100)
    errors.title = "Название: от 1 до 100 символов.";
  if (!["low", "medium", "high"].includes(priority))
    errors.priority = "Выберите приоритет.";
  if (
    !Number.isSafeInteger(categoryId) ||
    !categories.some((c) => c.id === categoryId)
  )
    errors.categoryId = "Выберите категорию.";
  return {
    valid: !Object.keys(errors).length,
    value: { title, priority, categoryId },
    errors,
  };
}
