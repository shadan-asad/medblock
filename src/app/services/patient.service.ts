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

  async getPatientById(id: number): Promise<Patient | null> {
    return this.databaseService.getPatientById(id);
  }

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    // Check for duplicate email before adding
    if (patient.email) {
      const emailExists = await this.databaseService.checkEmailExists(patient.email);
      if (emailExists) {
        throw new Error(`Email '${patient.email}' already exists.`);
      }
    }
    
    return this.databaseService.addPatient(patient);
  }

  async updatePatient(id: number, patient: Omit<Patient, 'id'>): Promise<Patient> {
    return this.databaseService.updatePatient(id, patient);
  }

  async deletePatient(id: number): Promise<void> {
    return this.databaseService.deletePatient(id);
  }
} 