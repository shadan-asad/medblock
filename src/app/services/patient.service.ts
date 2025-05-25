import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private databaseService: DatabaseService) {}

  getPatients(): Observable<Patient[]> {
    return this.databaseService.getPatients();
  }

  getPatientById(id: number): Promise<Patient | undefined> {
    return this.databaseService.getPatientById(id);
  }

  addPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    return this.databaseService.addPatient(patient);
  }

  updatePatient(patient: Patient): Promise<void> {
    return this.databaseService.updatePatient(patient);
  }

  deletePatient(id: number): Promise<void> {
    return this.databaseService.deletePatient(id);
  }
} 