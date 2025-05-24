import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1 class="display-4 fw-bold text-white mb-4">Welcome to MedBlock</h1>
        <p class="lead text-white-50 mb-5">Secure, Efficient, and Modern Patient Management System</p>
        <div class="cta-buttons">
          <a routerLink="/patients" class="btn btn-light btn-lg me-3">
            <i class="bi bi-people-fill me-2"></i>Manage Patients
          </a>
          <a routerLink="/sql-query" class="btn btn-outline-light btn-lg">
            <i class="bi bi-code-square me-2"></i>SQL Query
          </a>
        </div>
      </div>

      <div class="features-section">
        <h2 class="text-center mb-5">Key Features</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-shield-lock"></i>
              </div>
              <h3>Secure Storage</h3>
              <p>Your patient data is securely stored using PGlite, ensuring data integrity and privacy.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-arrows-angle-expand"></i>
              </div>
              <h3>Multi-tab Sync</h3>
              <p>Real-time synchronization across multiple browser tabs for seamless collaboration.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="bi bi-code-slash"></i>
              </div>
              <h3>SQL Query</h3>
              <p>Advanced SQL querying capabilities for complex data analysis and reporting.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h2 class="text-center mb-5">Statistics</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="stat-card">
              <h3>100%</h3>
              <p>Data Security</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <h3>24/7</h3>
              <p>Accessibility</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <h3>Real-time</h3>
              <p>Synchronization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
      color: white; /* Ensure text is readable on gradient background */
    }

    @keyframes gradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .hero-section {
      padding: 8rem 1rem; /* Add horizontal padding */
      text-align: center;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
    }

    .cta-buttons {
      margin-top: 2rem;
    }

    .btn {
      padding: 0.8rem 2rem;
      border-radius: 50px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-light {
        color: #1a2a6c; /* Dark text for light button */
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .features-section {
      padding: 6rem 1rem; /* Add horizontal padding */
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .features-section h2,
    .stats-section h2 {
        color: #fdbb2d; /* Highlight section titles */
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 2rem;
      text-align: center;
      color: white;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #fdbb2d;
    }

    .stats-section {
      padding: 6rem 1rem; /* Add horizontal padding */
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 2rem;
      text-align: center;
      color: white;
    }

    .stat-card h3 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #fdbb2d;
    }

    .stat-card p {
      font-size: 1.2rem;
      margin: 0;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 4rem 1rem; /* Adjust padding for smaller screens */
      }

      .features-section,
      .stats-section {
        padding: 3rem 1rem; /* Adjust padding for smaller screens */
      }

      .cta-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent {} 