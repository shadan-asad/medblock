import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  private patientsSubscription: Subscription | undefined;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    console.log('PatientListComponent: ngOnInit called.');
    this.patientsSubscription = this.patientService.getPatients().subscribe({
      next: (patients) => {
        console.log('PatientListComponent: Received patients data:', patients);
        this.patients = patients;
        this.loading = false;
        console.log('PatientListComponent: Patients array updated.', this.patients);
      },
      error: (error) => {
        console.error('PatientListComponent: Error loading patients:', error);
        this.loading = false;
      }
    });
    console.log('PatientListComponent: Subscribed to getPatients().');
  }
  
  ngOnDestroy(): void {
     console.log('PatientListComponent: ngOnDestroy called. Unsubscribing...');
     if (this.patientsSubscription) {
       this.patientsSubscription.unsubscribe();
       console.log('PatientListComponent: Unsubscribed from patientsSubject.');
     }
  }

  async deletePatient(id: number): Promise<void> {
    console.log(`PatientListComponent: deletePatient(${id}) called.`);
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        console.log(`PatientListComponent: Confirmed deletion of patient with id ${id}. Calling service.`);
        await this.patientService.deletePatient(id);
        console.log(`PatientListComponent: Patient with id ${id} deleted.`);
      } catch (error) {
        console.error(`PatientListComponent: Error deleting patient with id ${id}:`, error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  }
} 