import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | undefined;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.patient = await this.patientService.getPatientById(id);
      
      if (!this.patient) {
        this.router.navigate(['/patients']);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
    } finally {
      this.loading = false;
    }
  }

  editPatient(): void {
    // TODO: Implement edit functionality
    alert('Edit functionality to be implemented');
  }
} 