import { HttpErrorResponse } from '@angular/common/http';

/**
 * True when a Learning API call failed because the API could not be reached or errored
 * server-side (network error, timeout, 5xx). False for a definitive 4xx rejection
 * (validation error, locked unit, quiz required) — those must never be treated as
 * "offline" and satisfied from local fallbacks.
 */
export function isApiUnreachable(err: unknown): boolean {
  if (err instanceof HttpErrorResponse) {
    return err.status === 0 || err.status >= 500;
  }
  // Non-HTTP failures (rxjs TimeoutError, aborted fetch, etc.) count as unreachable.
  return true;
}
