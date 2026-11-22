import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout")
    return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network")
    return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response")
    return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404)
    return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http")
    return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.

export function createAppController({
  api,
  view,
  validateDraft = validateTaskDraft,
} = {}) {
  if (
    !api ||
    !view ||
    typeof api.loadInitialData !== "function" ||
    typeof view.setTasks !== "function"
  )
    throw new TypeError("Нужны API и представление");
  let tasks = [],
    categories = [],
    filters = {},
    editingId = null,
    active,
    sequence = 0,
    initialized = false;
  async function load() {
    active?.abort();
    active = new AbortController();
    const seq = ++sequence;
    view.setListState("loading");
    try {
      const r = await (initialized
        ? api.getTasks(filters, { signal: active.signal })
        : api.loadInitialData(filters, { signal: active.signal }));
      if (seq !== sequence) return;
      if (r.categories) {
        categories = r.categories;
        initialized = true;
        view.setCategories(categories);
      }
      tasks = r.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(r.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (e) {
      if (seq === sequence && e.kind !== "aborted")
        view.setListState("error", messageForError(e));
    }
  }
  function cancelEdit() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }
  async function mutate(action, clear = false) {
    view.setMutationPending(true);
    try {
      await action();
      if (clear) cancelEdit();
      view.notify("Операция выполнена.", "success");
      await load();
    } catch (e) {
      if (e.kind !== "aborted") view.notify(messageForError(e), "error");
    } finally {
      view.setMutationPending(false);
    }
  }
  return {
    start(value = {}) {
      filters = { ...value };
      return load();
    },
    applyFilters(value = {}) {
      filters = { ...value };
      return load();
    },
    refresh: load,
    async submit(draft) {
      const r = validateDraft(draft, categories);
      view.showFormErrors(r.errors);
      if (!r.valid) return;
      return mutate(
        () =>
          editingId === null
            ? api.createTask(r.value)
            : api.updateTask(editingId, r.value),
        true,
      );
    },
    beginEdit(id) {
      const t = tasks.find((t) => t.id === id);
      if (t) {
        editingId = id;
        view.showFormErrors({});
        view.setFormTask(t);
      }
    },
    cancelEdit,
    async toggleTask(id) {
      const t = tasks.find((t) => t.id === id);
      if (t) return mutate(() => api.setTaskCompleted(id, !t.completed));
    },
    async deleteTask(id) {
      return mutate(() => api.deleteTask(id), editingId === id);
    },
    async resetData() {
      return mutate(() => api.resetDemoData(), true);
    },
    destroy() {
      sequence++;
      active?.abort();
    },
  };
}
