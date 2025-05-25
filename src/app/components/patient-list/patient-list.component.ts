import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2 class="mb-4">Patient List</h2>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (patient of patients; track patient.id) {
              <tr>
                <td>{{ patient.id }}</td>
                <td>{{ patient.firstName }} {{ patient.lastName }}</td>
                <td>{{ patient.dateOfBirth }}</td>
                <td>{{ patient.gender }}</td>
                <td>{{ patient.email }}</td>
                <td>{{ patient.phone }}</td>
                <td>{{ patient.lastVisit }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <a [routerLink]="['/patients', patient.id]" class="btn btn-primary btn-sm">View</a>
                    <button class="btn btn-danger btn-sm ms-2" (click)="deletePatient(patient.id)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .table th {
      background-color: #f8f9fa;
    }
  `]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  deletePatient(id: number): void {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(id);
    }
  }
} 