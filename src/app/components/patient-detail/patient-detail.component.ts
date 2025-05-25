import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  async ngOnInit() {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (isNaN(id)) {
        this.error = 'Invalid patient ID';
        this.loading = false;
        return;
      }

      this.patient = await this.patientService.getPatientById(id);
      if (!this.patient) {
        this.error = 'Patient not found';
      }
    } catch (error) {
      this.error = 'Error loading patient details';
      console.error('Error loading patient:', error);
    } finally {
      this.loading = false;
    }
  }

  onBack() {
    this.router.navigate(['/patients']);
  }

  editPatient(): void {
    if (this.patient) {
      this.router.navigate(['/patients/edit', this.patient.id]);
    }
  }

  // TODO: Implement delete functionality (perhaps add a delete button here or on the list page)
  // deletePatient(): void {
  //   // Implementation depends on where delete action is desired
  //   alert('Delete functionality to be implemented');
  // }
} 