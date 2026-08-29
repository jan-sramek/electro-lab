import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimulateRequest, SimulateResponse } from './circuit-api.types';

@Injectable({ providedIn: 'root' })
export class CircuitApiClient {
  private readonly http = inject(HttpClient);

  simulate(body: SimulateRequest): Observable<SimulateResponse> {
    return this.http.post<SimulateResponse>('/api/circuit/simulate', body);
  }

  health(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>('/api/circuit/health');
  }
}
