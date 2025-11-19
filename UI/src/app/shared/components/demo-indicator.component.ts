import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentModeService } from '../../core/services/environment-mode.service';

@Component({
  selector: 'app-demo-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-indicator" *ngIf="isDemoMode()">
      <span class="badge">
        🎬 DEMO MODE
      </span>
      <span class="info">No backend connected. Using mock data.</span>
      <button (click)="toggleMode()" class="btn-toggle">Switch to Live</button>
    </div>
    
    <div class="live-indicator" *ngIf="!isDemoMode()">
      <span class="badge live">
        🌐 LIVE MODE
      </span>
      <span class="info">Connected to backend</span>
      <button (click)="toggleMode()" class="btn-toggle">Switch to Demo</button>
    </div>
  `,
  styles: [`
    .demo-indicator, .live-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      z-index: 1000;
    }

    .demo-indicator {
      background: #fff3cd;
      border: 1px solid #ffc107;
    }

    .live-indicator {
      background: #d4edda;
      border: 1px solid #28a745;
    }

    .badge {
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.1);
    }

    .badge.live {
      background: #28a745;
      color: white;
    }

    .info {
      color: #666;
      font-size: 12px;
    }

    .btn-toggle {
      padding: 4px 8px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: #5568d3;
      }
    }
  `]
})
export class DemoIndicatorComponent {
  isDemoMode = this.environmentMode.isDemoMode;

  constructor(private environmentMode: EnvironmentModeService) {}

  toggleMode(): void {
    this.environmentMode.toggleDemoMode();
  }
}
