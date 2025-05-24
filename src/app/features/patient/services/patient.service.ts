import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncService } from '../../../core/services/sync.service';
import { Patient } from '../../../shared/models/patient.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(
    private dbService: DatabaseService,
    private syncService: SyncService
  ) {}

  async createPatient(patient: Patient): Promise<Patient> {
    const query = `
      INSERT INTO patients (
        first_name, last_name, date_of_birth, email, phone, address, medical_history
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const params = [
      patient.firstName,
      patient.lastName,
      patient.dateOfBirth,
      patient.email || null,
      patient.phone || null,
      patient.address || null,
      patient.medicalHistory || null
    ];

    try {
      const result = await this.dbService.executeQuery(query, params);
      const newPatient = this.mapDbToPatient(result.rows[0]);

      // Broadcast the change to other tabs
      this.syncService.broadcast({
        type: 'INSERT',
        table: 'patients',
        data: newPatient,
        timestamp: Date.now()
      });

      return newPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  getPatients(): Observable<Patient[]> {
    return from(this.dbService.executeQuery('SELECT * FROM patients ORDER BY created_at DESC'))
      .pipe(
        map(result => result.rows.map((row: any) => this.mapDbToPatient(row)))
      );
  }

  getPatientById(id: number): Observable<Patient> {
    return from(this.dbService.executeQuery('SELECT * FROM patients WHERE id = $1', [id]))
      .pipe(
        map(result => this.mapDbToPatient(result.rows[0]))
      );
  }

  private mapDbToPatient(dbRow: any): Patient {
    return {
      id: dbRow.id,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      dateOfBirth: new Date(dbRow.date_of_birth),
      email: dbRow.email,
      phone: dbRow.phone,
      address: dbRow.address,
      medicalHistory: dbRow.medical_history,
      createdAt: new Date(dbRow.created_at),
      updatedAt: new Date(dbRow.updated_at)
    };
  }
} 