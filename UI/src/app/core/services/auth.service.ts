import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockDataService } from './mock-data.service';
import { EnvironmentModeService } from './environment-mode.service';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // Check for localStorage availability before initializing
  currentUser = signal<User | null>(this.loadUserFromStorage());
  isAuthenticated = signal<boolean>(this.checkAuthentication());

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private environmentMode: EnvironmentModeService
  ) {}

  private loadUserFromStorage(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) { // Check for localStorage availability
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null; // Return null if localStorage is not available
  }

  private checkAuthentication(): boolean {
    return typeof window !== 'undefined' && window.localStorage ? !!localStorage.getItem('token') : false; // Check for localStorage availability
  }

  login(username: string, password: string): Observable<any> {
    // Check if we should use demo mode
    if (this.environmentMode.getDemoMode()) {
      console.log('🎬 DEMO MODE: Using mock authentication');
      return this.mockDataService.mockLogin(username, password)
        .pipe(
          tap(response => {
            if (response && response.token) {
              this.storeUserData(response);
              this.currentUser.set(response);
              this.isAuthenticated.set(true);
            }
          }),
          catchError(error => {
            return throwError(() => new Error('Invalid credentials'));
          })
        );
    }

    // Use real backend
    console.log('🌐 LIVE MODE: Using backend authentication');
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.storeUserData(response);
            this.currentUser.set(response);
            this.isAuthenticated.set(true);
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  private storeUserData(response: User): void {
    if (typeof window !== 'undefined' && window.localStorage) { // Check for localStorage availability
      localStorage.setItem('token', response.token || '');
      localStorage.setItem('currentUser', JSON.stringify(response));
      localStorage.setItem('demo_mode', this.environmentMode.getDemoMode() ? 'true' : 'false');
    }
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) { // Check for localStorage availability
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('token') : null; // Check for localStorage availability
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}