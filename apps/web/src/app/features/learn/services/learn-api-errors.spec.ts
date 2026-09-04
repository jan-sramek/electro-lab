import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { isApiUnreachable } from './learn-api-errors';

describe('isApiUnreachable', () => {
  it('treats network errors (status 0) as unreachable', () => {
    expect(isApiUnreachable(new HttpErrorResponse({ status: 0 }))).toBeTrue();
  });

  it('treats 5xx as unreachable', () => {
    expect(isApiUnreachable(new HttpErrorResponse({ status: 500 }))).toBeTrue();
    expect(isApiUnreachable(new HttpErrorResponse({ status: 503 }))).toBeTrue();
  });

  it('treats 4xx as a definitive rejection, not offline', () => {
    expect(isApiUnreachable(new HttpErrorResponse({ status: 400 }))).toBeFalse();
    expect(isApiUnreachable(new HttpErrorResponse({ status: 409 }))).toBeFalse();
    expect(isApiUnreachable(new HttpErrorResponse({ status: 404 }))).toBeFalse();
  });

  it('treats non-HTTP failures (timeouts) as unreachable', () => {
    expect(isApiUnreachable(new TimeoutError())).toBeTrue();
    expect(isApiUnreachable(new Error('aborted'))).toBeTrue();
  });
});
