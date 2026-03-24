import { AsyncResult } from './async-result.type';

export function safeAsync<T>(promise: Promise<T>): Promise<AsyncResult<T>> {
  return promise.then(
    (value): AsyncResult<T> => ({ ok: true, value }),
    (error): AsyncResult<T> => ({ ok: false, error }),
  );
}
