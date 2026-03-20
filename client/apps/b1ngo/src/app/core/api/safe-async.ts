export type AsyncResult<T> = { ok: true; value: T } | { ok: false; error: unknown };

export function safeAsync<T>(promise: Promise<T>): Promise<AsyncResult<T>> {
  return promise.then(
    (value): AsyncResult<T> => ({ ok: true, value }),
    (error): AsyncResult<T> => ({ ok: false, error }),
  );
}
