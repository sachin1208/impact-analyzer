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
export class DependencyService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private environmentMode: EnvironmentModeService
  ) {}

  getAllDependencies(): Observable<any[]> {
    if (this.environmentMode.getDemoMode()) {
      console.log('🎬 DEMO MODE: Returning mock dependencies');
      return this.mockDataService.mockGetDependencies();
    }

    return this.http.get<any[]>(`${this.apiUrl}/dependencies`)
      .pipe(
        catchError(error => {
          console.warn('⚠️ Failed to load dependencies, using mock data');
          this.environmentMode.setDemoMode(true);
          return this.mockDataService.mockGetDependencies();
        })
      );
  }

  getDependencyGraph(): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      console.log('🎬 DEMO MODE: Returning mock dependency graph');
      return this.mockDataService.mockGetDependencyGraph();
    }

    return this.http.get<any>(`${this.apiUrl}/dependencies/graph`)
      .pipe(
        catchError(error => {
          console.warn('⚠️ Failed to load dependency graph, using mock data');
          this.environmentMode.setDemoMode(true);
          return this.mockDataService.mockGetDependencyGraph();
        })
      );
  }

  createDependency(dependency: any): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      return new Observable(observer => {
        observer.next({ ...dependency, id: Math.random() });
        observer.complete();
      });
    }

    return this.http.post<any>(`${this.apiUrl}/dependencies`, dependency);
  }

  deleteDependency(id: number): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      return new Observable(observer => {
        observer.next({ success: true });
        observer.complete();
      });
    }

    return this.http.delete(`${this.apiUrl}/dependencies/${id}`);
  }
}
