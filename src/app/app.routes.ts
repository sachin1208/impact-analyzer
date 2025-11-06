import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AnalyzeComponent } from './features/impact-analysis/analyze/analyze.component';
import { ResultsComponent } from './features/impact-analysis/results/results.component';
import { DependencyGraphComponent } from './features/dependencies/dependency-graph.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'impact-analysis',
    component: AnalyzeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'impact-analysis/results/:id',
    component: ResultsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dependencies',
    component: DependencyGraphComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
