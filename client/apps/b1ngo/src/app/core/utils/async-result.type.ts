export type AsyncResult<T> = { ok: true; value: T } | { ok: false; error: unknown };
