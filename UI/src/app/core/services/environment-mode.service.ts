import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentModeService {
  
  // Signal to track whether we're in demo mode
  isDemoMode = signal<boolean>(false); // Initialize with a default value
  
  constructor() {
    this.isDemoMode.set(this.getInitialDemoMode()); // Set the initial value in the constructor
    this.checkBackendAvailability();
  }

  /**
   * Get initial demo mode from sessionStorage
   * If user manually switched to demo mode, remember it
   */
  private getInitialDemoMode(): boolean {
    if (typeof window !== 'undefined' && window.sessionStorage) { // Check for window and sessionStorage
      const stored = sessionStorage.getItem('demo_mode');
      if (stored !== null) {
        return stored === 'true';
      }
    }
    // Default to demo mode
    return true;
  }

  /**
   * Check if backend is available
   */
  checkBackendAvailability(): void {
    // Try to ping the backend
    fetch('http://localhost:8080/api/actuator/health')
      .then(response => {
        if (response.ok) {
          // Backend is available, switch to real mode
          this.setDemoMode(false);
        }
      })
      .catch(() => {
        // Backend not available, use demo mode
        this.setDemoMode(true);
      });
  }

  /**
   * Manually set demo mode
   */
  setDemoMode(isDemoMode: boolean): void {
    this.isDemoMode.set(isDemoMode);
    if (typeof window !== 'undefined' && window.sessionStorage) { // Check for window and sessionStorage
      sessionStorage.setItem('demo_mode', isDemoMode.toString());
    }
  }

  /**
   * Get demo mode status
   */
  getDemoMode(): boolean {
    return this.isDemoMode();
  }

  /**
   * Toggle demo mode (useful for debugging)
   */
  toggleDemoMode(): void {
    this.setDemoMode(!this.isDemoMode());
  }

  /**
   * Retry backend connection
   */
  retryBackendConnection(): void {
    this.checkBackendAvailability();
  }
}