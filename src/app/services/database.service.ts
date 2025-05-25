import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { PGlite } from '@electric-sql/pglite';
import { BehaviorSubject, Observable, from, switchMap } from 'rxjs';
import { Patient } from '../models/patient.model';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface PatientRow {
  id: number;
  name: string;
  gender: string;
  date_of_birth: string;
  blood_type: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  address: string | undefined;
  emergency_contact: string | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: PGlite | null = null;
  private isInitialized = false;
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      console.log('DatabaseService: Constructor called');
      this.initializeDatabase().catch(error => {
        console.error('DatabaseService: Failed to initialize database:', error);
      });
    }
  }

  private async initializeDatabase() {
    if (this.isInitialized) {
      console.log('DatabaseService: Database already initialized');
      return;
    }

    try {
      console.log('DatabaseService: Starting initialization...');
      
      // Fetch WASM and data files
      console.log('DatabaseService: Fetching WASM and data files...');
      const wasmResponse = await firstValueFrom(this.http.get('/pglite/pglite.wasm', { responseType: 'arraybuffer' }));
      const dataResponse = await firstValueFrom(this.http.get('/pglite/pglite.data', { responseType: 'arraybuffer' }));
      console.log('DatabaseService: Files fetched successfully');
      
      // Create Blob for data file
      const dataBlob = new Blob([dataResponse], { type: 'application/octet-stream' });
      
      // Initialize PGlite with explicit dataDir
      console.log('DatabaseService: Creating PGlite instance...');
      this.db = new PGlite({
        wasmModule: await WebAssembly.compile(wasmResponse),
        fsBundle: dataBlob,
        dataDir: 'idb://medblock-db' // Explicitly set IndexedDB storage location
      });
      console.log('DatabaseService: PGlite instance created');

      // Wait for database to be ready
      console.log('DatabaseService: Waiting for database to be ready...');
      await this.db.waitReady;
      console.log('DatabaseService: Database is ready');

      // Create tables if they don't exist
      console.log('DatabaseService: Creating tables...');
      await this.createTables();
      
      // Check if we need to seed the database
      console.log('DatabaseService: Checking if database needs seeding...');
      const result = await this.db.query('SELECT COUNT(*) as count FROM patients');
      const count = parseInt((result.rows[0] as { count: string }).count);
      console.log('DatabaseService: Current patient count:', count);
      
      if (count === 0) {
        console.log('DatabaseService: Seeding database...');
        await this.seedDatabase();
      }
      
      this.isInitialized = true;
      console.log('DatabaseService: Initialization complete');

      // Load patients after initialization
      console.log('DatabaseService: Loading initial patients...');
      await this.loadPatients();
      console.log('DatabaseService: Initial patients loaded');
    } catch (error) {
      console.error('DatabaseService: Error during initialization:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('DatabaseService: Creating patients table...');
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          gender VARCHAR(10) NOT NULL,
          date_of_birth DATE NOT NULL,
          blood_type VARCHAR(5),
          email VARCHAR(100),
          phone VARCHAR(20),
          address TEXT,
          emergency_contact TEXT
        )
      `);
      console.log('DatabaseService: Tables created successfully');
    } catch (error) {
      console.error('DatabaseService: Error creating tables:', error);
      throw error;
    }
  }

  private async seedDatabase() {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const mockPatients = [
        {
          name: 'John Doe',
          gender: 'Male',
          date_of_birth: '1980-01-15',
          blood_type: 'O+',
          email: 'john.doe@example.com',
          phone: '1234567890',
          address: '123 Main St, City',
          emergency_contact: 'Jane Doe (Spouse) - 9876543210'
        },
        {
          name: 'Jane Smith',
          gender: 'Female',
          date_of_birth: '1985-05-20',
          blood_type: 'A+',
          email: 'jane.smith@example.com',
          phone: '2345678901',
          address: '456 Oak Ave, Town',
          emergency_contact: 'John Smith (Spouse) - 8765432109'
        }
      ];

      for (const patient of mockPatients) {
        await this.db.query(`
          INSERT INTO patients (name, gender, date_of_birth, blood_type, email, phone, address, emergency_contact)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          patient.name,
          patient.gender,
          patient.date_of_birth,
          patient.blood_type,
          patient.email,
          patient.phone,
          patient.address,
          patient.emergency_contact
        ]);
      }
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  private async loadPatients() {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      console.log('DatabaseService: Loading patients from database...');
      const result = await this.db.query('SELECT * FROM patients ORDER BY name');
      console.log('DatabaseService: Query result:', result);
      
      const patients = (result.rows as PatientRow[]).map(row => ({
        id: row.id,
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        bloodType: row.blood_type,
        email: row.email,
        phone: row.phone,
        address: row.address,
        emergencyContact: row.emergency_contact
      }));
      
      console.log('DatabaseService: Mapped patients:', patients);
      this.patientsSubject.next(patients);
      console.log('DatabaseService: Patients loaded and subject updated');
    } catch (error) {
      console.error('DatabaseService: Error loading patients:', error);
      this.patientsSubject.next([]);
    }
  }

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  async getPatientById(id: number): Promise<Patient | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query('SELECT * FROM patients WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0] as PatientRow;
      return {
        id: row.id,
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        bloodType: row.blood_type,
        email: row.email,
        phone: row.phone,
        address: row.address,
        emergencyContact: row.emergency_contact
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async checkEmailExists(email: string | undefined): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    if (!email) return false; // No email provided, no duplicate to check

    try {
      console.log('DatabaseService: Checking for existing email:', email);
      const result = await this.db.query('SELECT COUNT(*) as count FROM patients WHERE email = $1', [email]);
      const count = parseInt((result.rows[0] as { count: string }).count);
      console.log('DatabaseService: Email count:', count);
      return count > 0;
    } catch (error) {
      console.error('DatabaseService: Error checking email existence:', error);
      throw error;
    }
  }

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(`
        INSERT INTO patients (name, gender, date_of_birth, blood_type, email, phone, address, emergency_contact)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        patient.name,
        patient.gender,
        patient.dateOfBirth,
        patient.bloodType,
        patient.email,
        patient.phone,
        patient.address,
        patient.emergencyContact
      ]);

      const row = result.rows[0] as PatientRow;
      const newPatient = {
        id: row.id,
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        bloodType: row.blood_type,
        email: row.email,
        phone: row.phone,
        address: row.address,
        emergencyContact: row.emergency_contact
      };

      // Reload patients after adding
      await this.loadPatients();
      
      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  }

  async updatePatient(id: number, patient: Omit<Patient, 'id'>): Promise<Patient> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(`
        UPDATE patients
        SET name = $1, gender = $2, date_of_birth = $3, blood_type = $4,
            email = $5, phone = $6, address = $7, emergency_contact = $8
        WHERE id = $9
        RETURNING *
      `, [
        patient.name,
        patient.gender,
        patient.dateOfBirth,
        patient.bloodType,
        patient.email,
        patient.phone,
        patient.address,
        patient.emergencyContact,
        id
      ]);

      const row = result.rows[0] as PatientRow;
      const updatedPatient = {
        id: row.id,
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        bloodType: row.blood_type,
        email: row.email,
        phone: row.phone,
        address: row.address,
        emergencyContact: row.emergency_contact
      };

      // Reload patients after updating
      await this.loadPatients();
      
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.query('DELETE FROM patients WHERE id = $1', [id]);
      // Reload patients after deleting
      await this.loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
}