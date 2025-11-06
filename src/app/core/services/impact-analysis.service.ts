import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';
import { EnvironmentModeService } from './environment-mode.service';

@Injectable({
  providedIn: 'root'
})
export class ImpactAnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private environmentMode: EnvironmentModeService
  ) {}

  analyzeImpact(request: any): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      console.log('🎬 DEMO MODE: Running mock impact analysis');
      return this.mockDataService.mockAnalyzeImpact(request);
    }

    return this.http.post<any>(`${this.apiUrl}/impact/analyze`, request)
      .pipe(
        catchError(error => {
          console.warn('⚠️ Failed to analyze impact, using mock data');
          this.environmentMode.setDemoMode(true);
          return this.mockDataService.mockAnalyzeImpact(request);
        })
      );
  }

  getAnalysis(id: number): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      // Return first mock analysis for demo
      return new Observable(observer => {
        observer.next({
          id,
          analysisId: id,
          riskScore: 73,
          riskLevel: 'HIGH',
          cascadeDepth: 3,
          affectedModules: [
            { id: 2, moduleName: 'User Profile', riskScore: 75, cascadeDepth: 1 }
          ]
        });
        observer.complete();
      });
    }

    return this.http.get<any>(`${this.apiUrl}/impact/${id}`);
  }

  getAllAnalyses(): Observable<any[]> {
    if (this.environmentMode.getDemoMode()) {
      console.log('🎬 DEMO MODE: Returning mock analyses');
      return this.mockDataService.mockGetAnalyses();
    }

    return this.http.get<any[]>(`${this.apiUrl}/impact`)
      .pipe(
        catchError(error => {
          console.warn('⚠️ Failed to load analyses, using mock data');
          this.environmentMode.setDemoMode(true);
          return this.mockDataService.mockGetAnalyses();
        })
      );
  }
}
