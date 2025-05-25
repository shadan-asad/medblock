import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [class.overlay]="overlay">
      <div class="spinner-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div *ngIf="message" class="spinner-message mt-2">{{ message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }

    .loading-spinner.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .spinner-message {
      color: #0d6efd;
      font-size: 0.9rem;
      text-align: center;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() overlay: boolean = false;
} 