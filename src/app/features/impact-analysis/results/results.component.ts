import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImpactAnalysisService } from '../../../core/services/impact-analysis.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  analysis = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private impactAnalysisService: ImpactAnalysisService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnalysis(parseInt(id));
    }
  }

  loadAnalysis(id: number): void {
    this.impactAnalysisService.getAnalysis(id).subscribe({
      next: (result) => {
        this.analysis.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load analysis results');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/impact-analysis']);
  }

  getRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  }
}
