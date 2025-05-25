import { Injectable } from '@angular/core';
import { Database } from '@pglite/core';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: Database;

  constructor() {
    this.db = new Database('medblock_db');
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Create patients table if it doesn't exist
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        medical_history TEXT,
        last_visit DATE
      );
    `);

    // Check if we have any data
    const result = await this.db.query('SELECT COUNT(*) FROM patients');
    if (result.rows[0].count === '0') {
      // Insert sample data
      await this.db.query(`
        INSERT INTO patients (first_name, last_name, date_of_birth, gender, email, phone, address, medical_history, last_visit)
        VALUES
          ('John', 'Doe', '1980-05-15', 'Male', 'john.doe@email.com', '555-0123', '123 Main St, City', 'Hypertension, Type 2 Diabetes', '2024-03-15'),
          ('Jane', 'Smith', '1985-08-22', 'Female', 'jane.smith@email.com', '555-0124', '456 Oak Ave, Town', 'Asthma', '2024-04-01'),
          ('Michael', 'Johnson', '1975-11-30', 'Male', 'michael.j@email.com', '555-0125', '789 Pine Rd, Village', 'Arthritis', '2024-03-28');
      `);
    }
  }

  async getAllPatients(): Promise<Patient[]> {
    const result = await this.db.query('SELECT * FROM patients ORDER BY id');
    return result.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      email: row.email,
      phone: row.phone,
      address: row.address,
      medicalHistory: row.medical_history,
      lastVisit: row.last_visit
    }));
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    const result = await this.db.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      email: row.email,
      phone: row.phone,
      address: row.address,
      medicalHistory: row.medical_history,
      lastVisit: row.last_visit
    };
  }

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const result = await this.db.query(`
      INSERT INTO patients (first_name, last_name, date_of_birth, gender, email, phone, address, medical_history, last_visit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      patient.firstName,
      patient.lastName,
      patient.dateOfBirth,
      patient.gender,
      patient.email,
      patient.phone,
      patient.address,
      patient.medicalHistory,
      patient.lastVisit
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      email: row.email,
      phone: row.phone,
      address: row.address,
      medicalHistory: row.medical_history,
      lastVisit: row.last_visit
    };
  }

  async updatePatient(patient: Patient): Promise<Patient> {
    const result = await this.db.query(`
      UPDATE patients
      SET first_name = $1, last_name = $2, date_of_birth = $3, gender = $4,
          email = $5, phone = $6, address = $7, medical_history = $8, last_visit = $9
      WHERE id = $10
      RETURNING *
    `, [
      patient.firstName,
      patient.lastName,
      patient.dateOfBirth,
      patient.gender,
      patient.email,
      patient.phone,
      patient.address,
      patient.medicalHistory,
      patient.lastVisit,
      patient.id
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      email: row.email,
      phone: row.phone,
      address: row.address,
      medicalHistory: row.medical_history,
      lastVisit: row.last_visit
    };
  }

  async deletePatient(id: number): Promise<void> {
    await this.db.query('DELETE FROM patients WHERE id = $1', [id]);
  }

  // Method to view raw database contents
  async viewDatabase(): Promise<any> {
    const result = await this.db.query('SELECT * FROM patients');
    return result.rows;
  }
} 