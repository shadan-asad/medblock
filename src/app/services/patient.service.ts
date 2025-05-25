import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients: Patient[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      email: 'john.doe@email.com',
      phone: '555-0123',
      address: '123 Main St, City',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
      lastVisit: '2024-03-15'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-08-22',
      gender: 'Female',
      email: 'jane.smith@email.com',
      phone: '555-0124',
      address: '456 Oak Ave, Town',
      medicalHistory: 'Asthma',
      lastVisit: '2024-04-01'
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Johnson',
      dateOfBirth: '1975-11-30',
      gender: 'Male',
      email: 'michael.j@email.com',
      phone: '555-0125',
      address: '789 Pine Rd, Village',
      medicalHistory: 'Arthritis',
      lastVisit: '2024-03-28'
    }
  ];

  private patientsSubject = new BehaviorSubject<Patient[]>(this.patients);

  constructor() { }

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  getPatientById(id: number): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  addPatient(patient: Omit<Patient, 'id'>): void {
    const newPatient = {
      ...patient,
      id: this.patients.length + 1
    };
    this.patients.push(newPatient);
    this.patientsSubject.next(this.patients);
  }

  updatePatient(patient: Patient): void {
    const index = this.patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      this.patients[index] = patient;
      this.patientsSubject.next(this.patients);
    }
  }

  deletePatient(id: number): void {
    this.patients = this.patients.filter(p => p.id !== id);
    this.patientsSubject.next(this.patients);
  }
} 