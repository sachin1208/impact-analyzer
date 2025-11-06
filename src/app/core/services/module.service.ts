import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';
import { EnvironmentModeService } from './environment-mode.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private environmentMode: EnvironmentModeService
  ) {}

  getAllModules(): Observable<any[]> {
    if (this.environmentMode.getDemoMode()) {
      console.log('🎬 DEMO MODE: Returning mock modules');
      return this.mockDataService.mockGetModules();
    }

    return this.http.get<any[]>(`${this.apiUrl}/modules`)
      .pipe(
        catchError(error => {
          console.warn('⚠️ Failed to load modules from backend, using mock data');
          this.environmentMode.setDemoMode(true);
          return this.mockDataService.mockGetModules();
        })
      );
  }

  getModuleById(id: number): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      return this.mockDataService.mockGetModule(id);
    }

    return this.http.get<any>(`${this.apiUrl}/modules/${id}`)
      .pipe(
        catchError(error => {
          this.environmentMode.setDemoMode(true);
          return this.mockDataService.mockGetModule(id);
        })
      );
  }

  createModule(module: any): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      return new Observable(observer => {
        observer.next({ ...module, id: Math.random() });
        observer.complete();
      });
    }

    return this.http.post<any>(`${this.apiUrl}/modules`, module);
  }

  updateModule(id: number, module: any): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      return new Observable(observer => {
        observer.next({ ...module, id });
        observer.complete();
      });
    }

    return this.http.put<any>(`${this.apiUrl}/modules/${id}`, module);
  }

  deleteModule(id: number): Observable<any> {
    if (this.environmentMode.getDemoMode()) {
      return new Observable(observer => {
        observer.next({ success: true });
        observer.complete();
      });
    }

    return this.http.delete(`${this.apiUrl}/modules/${id}`);
  }
}
