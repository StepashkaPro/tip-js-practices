export class ApiError extends Error {
  constructor(
    message,
    {
      kind,
      status = null,
      code = null,
      details = null,
      url = null,
      cause,
    } = {},
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(
    baseUrl.replace(/\/+$/, "") + "/" + path.replace(/^\+|^\//g, ""),
  );
  for (const [k, v] of Object.entries(query))
    if (v !== "" && v !== undefined && v !== null)
      url.searchParams.set(k, String(v));
  return url;
}
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new TypeError("Нужен абсолютный baseUrl");
  }
  if (
    !["http:", "https:"].includes(base.protocol) ||
    typeof fetchFn !== "function" ||
    !Number.isSafeInteger(timeoutMs) ||
    base.search ||
    base.hash ||
    timeoutMs <= 0
  )
    throw new TypeError("Неверная конфигурация");
  return {
    async requestJson(
      path,
      {
        method = "GET",
        query = {},
        body,
        signal,
        timeoutMs: limit = timeoutMs,
      } = {},
    ) {
      method = method.toUpperCase();
      if (
        !["GET", "POST", "PATCH", "DELETE"].includes(method) ||
        (method === "GET" && body !== undefined)
      )
        throw new TypeError("Неверный метод или тело");
      const url = buildUrl(baseUrl, path, query).href,
        controller = new AbortController();
      let timedOut = false;
      const abort = () => controller.abort();
      if (signal?.aborted) abort();
      signal?.addEventListener("abort", abort, { once: true });
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, limit);
      try {
        const headers = { Accept: "application/json" };
        const options = { method, headers, signal: controller.signal };
        if (body !== undefined) {
          headers["Content-Type"] = "application/json";
          options.body = JSON.stringify(body);
        }
        const response = await fetchFn(url, options);
        if (!response || typeof response.ok !== "boolean" || !response.headers)
          throw new ApiError("Неверный ответ", {
            kind: "invalid-response",
            url,
          });
        if (!response.ok) {
          let payload;
          try {
            payload = await response.json();
          } catch {}
          const e = payload?.error;
          throw new ApiError(e?.message ?? `HTTP ${response.status}`, {
            kind: "http",
            status: response.status,
            code: e?.code ?? null,
            details: e?.details ?? null,
            url,
          });
        }
        if (response.status === 204) return null;
        if (!response.headers.get("content-type")?.includes("application/json"))
          throw new ApiError("Ожидался JSON", {
            kind: "invalid-response",
            url,
          });
        try {
          return await response.json();
        } catch (cause) {
          throw new ApiError("Повреждённый JSON", {
            kind: "invalid-response",
            url,
            cause,
          });
        }
      } catch (cause) {
        if (cause instanceof ApiError) throw cause;
        throw new ApiError(
          timedOut
            ? "Превышено время ожидания"
            : signal?.aborted
              ? "Запрос отменён"
              : "Ошибка сети",
          {
            kind: timedOut
              ? "timeout"
              : signal?.aborted
                ? "aborted"
                : "network",
            url,
            cause,
          },
        );
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
    },
  };
}
