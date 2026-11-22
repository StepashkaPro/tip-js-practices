import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    isPositiveSafeInteger(value.id) &&
    typeof value.title === "string" &&
    value.title.trim().length >= 1 &&
    value.title.trim().length <= 100 &&
    typeof value.completed === "boolean" &&
    ALLOWED_PRIORITIES.has(value.priority) &&
    isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    isPositiveSafeInteger(value.id) &&
    typeof value.name === "string" &&
    value.name.trim().length >= 1 &&
    value.name.trim().length <= 100,
  );
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function")
    throw new TypeError("Нужен requestJson");
  const checkId = (id) => {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Неверный id");
  };
  const unique = (items, predicate) =>
    Array.isArray(items) &&
    items.every(predicate) &&
    new Set(items.map((t) => t.id)).size === items.length;
  function filters(value = {}) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new TypeError("Неверные фильтры");
    const q = {};
    for (const [k, v] of Object.entries(value)) {
      if (!ALLOWED_FILTERS.has(k)) throw new TypeError("Неизвестный фильтр");
      if (v === undefined || v === null || v === "") continue;
      if (
        (k === "completed" && typeof v !== "boolean") ||
        (k === "priority" && !ALLOWED_PRIORITIES.has(v)) ||
        (k === "categoryId" && !isPositiveSafeInteger(v)) ||
        (k === "q" && (typeof v !== "string" || v.trim().length > 100))
      )
        throw new TypeError("Неверный фильтр");
      q[k] = k === "q" ? v.trim() : v;
    }
    return q;
  }
  const single = (r) => {
    if (!isTask(r?.data)) throw invalidResponse("Неверная задача");
    return r.data;
  };
  const api = {
    async getTasks(value = {}, options) {
      const query = filters(value);
      const r = await client.requestJson("/tasks", { query, ...options });
      if (!unique(r?.data, isTask) || !r.meta || r.meta.total !== r.data.length)
        throw invalidResponse("Неверный список задач");
      return { tasks: r.data, meta: r.meta };
    },
    async getTaskById(id, options) {
      checkId(id);
      return single(await client.requestJson("/tasks/" + id, options));
    },
    async getCategories(options) {
      const r = await client.requestJson("/categories", options);
      if (!unique(r?.data, isCategory))
        throw invalidResponse("Неверные категории");
      return r.data;
    },
    async loadInitialData(value = {}, options) {
      const [result, categories] = await Promise.all([
        api.getTasks(value, options),
        api.getCategories(options),
      ]);
      return { ...result, categories };
    },
    async createTask(draft, options) {
      return single(
        await client.requestJson("/tasks", {
          method: "POST",
          body: draft,
          ...options,
        }),
      );
    },
    async updateTask(id, changes, options) {
      checkId(id);
      return single(
        await client.requestJson("/tasks/" + id, {
          method: "PATCH",
          body: changes,
          ...options,
        }),
      );
    },
    async setTaskCompleted(id, completed, options) {
      if (typeof completed !== "boolean")
        throw new TypeError("Неверный статус");
      return api.updateTask(id, { completed }, options);
    },
    async deleteTask(id, options) {
      checkId(id);
      const r = await client.requestJson("/tasks/" + id, {
        method: "DELETE",
        ...options,
      });
      if (r !== null) throw invalidResponse("Ожидался 204");
      return null;
    },
    async resetDemoData(options) {
      const r = await client.requestJson("/debug/reset", {
        method: "POST",
        ...options,
      });
      if (
        r?.data?.reset !== true ||
        !Number.isSafeInteger(r.data.total) ||
        r.data.total < 0
      )
        throw invalidResponse("Неверное подтверждение");
      return r.data;
    },
  };
  return api;
}
