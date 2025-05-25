import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      @if (patient) {
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h2>Patient Details</h2>
            <div>
              <button class="btn btn-secondary me-2" routerLink="/patients">Back to List</button>
              <button class="btn btn-primary" (click)="editPatient()">Edit</button>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h4>Personal Information</h4>
                <table class="table">
                  <tr>
                    <th>Name:</th>
                    <td>{{ patient.firstName }} {{ patient.lastName }}</td>
                  </tr>
                  <tr>
                    <th>Date of Birth:</th>
                    <td>{{ patient.dateOfBirth }}</td>
                  </tr>
                  <tr>
                    <th>Gender:</th>
                    <td>{{ patient.gender }}</td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h4>Contact Information</h4>
                <table class="table">
                  <tr>
                    <th>Email:</th>
                    <td>{{ patient.email }}</td>
                  </tr>
                  <tr>
                    <th>Phone:</th>
                    <td>{{ patient.phone }}</td>
                  </tr>
                  <tr>
                    <th>Address:</th>
                    <td>{{ patient.address }}</td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-12">
                <h4>Medical Information</h4>
                <table class="table">
                  <tr>
                    <th>Medical History:</th>
                    <td>{{ patient.medicalHistory }}</td>
                  </tr>
                  <tr>
                    <th>Last Visit:</th>
                    <td>{{ patient.lastVisit }}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="alert alert-warning">
          Patient not found
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .table th {
      width: 150px;
      background-color: #f8f9fa;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.patient = this.patientService.getPatientById(id);
    
    if (!this.patient) {
      this.router.navigate(['/patients']);
    }
  }

  editPatient(): void {
    // TODO: Implement edit functionality
    alert('Edit functionality to be implemented');
  }
} 