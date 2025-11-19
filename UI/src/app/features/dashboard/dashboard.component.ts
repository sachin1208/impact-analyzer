import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleService } from '../../core/services/module.service';
import { DependencyService } from '../../core/services/dependency.service';
import { ImpactAnalysisService } from '../../core/services/impact-analysis.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Using Angular 17 Signals
  totalModules = signal<number>(0);
  totalDependencies = signal<number>(0);
  totalAnalyses = signal<number>(0);
  criticalCount = signal<number>(0);
  loading = signal<boolean>(true);
  error = signal<string>('');
  currentUser = this.authService.currentUser;

  constructor(
    private moduleService: ModuleService,
    private dependencyService: DependencyService,
    private impactAnalysisService: ImpactAnalysisService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.totalModules.set(modules.length);
        this.criticalCount.set(modules.filter(m => m.criticalityLevel === 'CRITICAL').length);
      },
      error: () => {
        this.error.set('Failed to load modules');
        this.loading.set(false);
      }
    });

    this.dependencyService.getAllDependencies().subscribe({
      next: (dependencies) => {
        this.totalDependencies.set(dependencies.length);
      },
      error: () => {
        this.error.set('Failed to load dependencies');
      }
    });

    this.impactAnalysisService.getAllAnalyses().subscribe({
      next: (analyses) => {
        this.totalAnalyses.set(analyses.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load analyses');
        this.loading.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
