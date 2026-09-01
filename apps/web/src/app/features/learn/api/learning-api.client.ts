import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LabVerifyRequest,
  LabVerifyResponse,
  LearnCatalogResponse,
  LearnProgressSnapshotResponse,
  LearnUnitDetailResponse,
  LearnUnitProgressDto,
  QuizSubmitRequest,
  QuizSubmitResponse
} from './learning-api.types';
import { LearnSessionService } from '../services/learn-session.service';

@Injectable({ providedIn: 'root' })
export class LearningApiClient {
  private readonly http = inject(HttpClient);
  private readonly session = inject(LearnSessionService);

  getCatalog(): Observable<LearnCatalogResponse> {
    return this.http.get<LearnCatalogResponse>('/api/learning/catalog', {
      headers: this.sessionHeaders()
    });
  }

  getUnit(moduleSlug: string, unitSlug: string): Observable<LearnUnitDetailResponse> {
    return this.http.get<LearnUnitDetailResponse>(
      `/api/learning/catalog/${moduleSlug}/${unitSlug}`,
      { headers: this.sessionHeaders() }
    );
  }

  getProgress(): Observable<LearnProgressSnapshotResponse> {
    return this.http.get<LearnProgressSnapshotResponse>('/api/learning/progress', {
      headers: this.sessionHeaders()
    });
  }

  markRead(moduleSlug: string, unitSlug: string, complete: boolean): Observable<LearnUnitProgressDto> {
    return this.http.put<LearnUnitProgressDto>(
      `/api/learning/progress/${moduleSlug}/${unitSlug}/read`,
      { complete },
      { headers: this.sessionHeaders() }
    );
  }

  submitQuiz(
    moduleSlug: string,
    unitSlug: string,
    body: QuizSubmitRequest
  ): Observable<QuizSubmitResponse> {
    return this.http.post<QuizSubmitResponse>(
      `/api/learning/quiz/${moduleSlug}/${unitSlug}/submit`,
      body,
      { headers: this.sessionHeaders() }
    );
  }

  verifyLab(
    moduleSlug: string,
    unitSlug: string,
    body: LabVerifyRequest
  ): Observable<LabVerifyResponse> {
    return this.http.post<LabVerifyResponse>(
      `/api/learning/lab-challenge/${moduleSlug}/${unitSlug}/verify`,
      body,
      { headers: this.sessionHeaders() }
    );
  }

  health(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>('/api/learning/health');
  }

  private sessionHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-Learn-Session': this.session.sessionId() });
  }
}
