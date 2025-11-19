import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ImpactAnalysisService } from '../../../core/services/impact-analysis.service';
import { ModuleService } from '../../../core/services/module.service';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.scss']
})
export class AnalyzeComponent implements OnInit {
  analyzeForm: FormGroup;
  modules = signal<any[]>([]);
  isAnalyzing = signal<boolean>(false);
  submitted = signal<boolean>(false);
  error = signal<string>('');
  loadingModules = signal<boolean>(true);

  changeTypes = [
  { 
    value: 'BUG_FIX', 
    label: 'Bug Fix',
    icon: '🐛',
    description: 'Fixing existing issues or bugs'
  },
  { 
    value: 'FEATURE_ENHANCEMENT', 
    label: 'Feature Enhancement',
    icon: '✨',
    description: 'Adding new functionality'
  },
  { 
    value: 'REFACTORING', 
    label: 'Refactoring',
    icon: '🔧',
    description: 'Improving code without changing behavior'
  },
  { 
    value: 'DATA_MODEL_CHANGE', 
    label: 'Data Model Change',
    icon: '💾',
    description: 'Modifying data structures or schemas'
  }
];


//   changeTypes = [
//     { value: 'BUG_FIX', label: 'Bug Fix' },
//     { value: 'FEATURE_ENHANCEMENT', label: 'Feature Enhancement' },
//     { value: 'REFACTORING', label: 'Refactoring' },
//     { value: 'DATA_MODEL_CHANGE', label: 'Data Model Change' }
//   ];

  constructor(
    private fb: FormBuilder,
    private impactAnalysisService: ImpactAnalysisService,
    private moduleService: ModuleService,
    private router: Router
  ) {
    this.analyzeForm = this.fb.group({
      moduleId: ['', Validators.required],
      changeDescription: ['', [Validators.required, Validators.minLength(10)]],
      changeType: ['BUG_FIX', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.loadingModules.set(true);
    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules.set(modules);
        this.loadingModules.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load modules. Please try again.');
        this.loadingModules.set(false);
      }
    });
  }

  get f() {
    return this.analyzeForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.analyzeForm.invalid) {
      return;
    }

    this.isAnalyzing.set(true);
    this.error.set('');

    const request = {
      moduleId: parseInt(this.f['moduleId'].value),
      changeDescription: this.f['changeDescription'].value,
      changeType: this.f['changeType'].value
    };

    this.impactAnalysisService.analyzeImpact(request).subscribe({
      next: (result) => {
        this.isAnalyzing.set(false);
        // Navigate to results page with analysis ID
        this.router.navigate(['/impact-analysis/results', result.analysisId]);
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Analysis failed. Please try again.');
        this.isAnalyzing.set(false);
      }
    });
  }

  resetForm(): void {
    this.analyzeForm.reset({ changeType: 'BUG_FIX' });
    this.submitted.set(false);
    this.error.set('');
  }

  getSelectedModuleInfo(): any {
    const moduleId = this.f['moduleId'].value;
    return this.modules().find(m => m.id === parseInt(moduleId));
  }

  isFormValid(): boolean {
    return this.analyzeForm.valid && !this.isAnalyzing();
  }
}
