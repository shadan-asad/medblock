import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { PGlite } from '@electric-sql/pglite';
import { BehaviorSubject, Observable, from, switchMap } from 'rxjs';
import { Patient } from '../models/patient.model';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
      console.log('DatabaseService: Initializing database...');
      this.initialize().catch(error => {
        console.error('DatabaseService: Initialization failed during constructor', error);
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('DatabaseService: initialize() called, but already initialized.');
      return;
    }

    try {
      console.log('DatabaseService: Starting database initialization process.');
      
      // Fetch the WASM module and filesystem bundle
      console.log('DatabaseService: Fetching pglite.wasm and pglite.data...');
      const [wasmResponse, fsResponseArrayBuffer] = await Promise.all([
        firstValueFrom(this.http.get('/pglite/pglite.wasm', { responseType: 'arraybuffer' })),
        firstValueFrom(this.http.get('/pglite/pglite.data', { responseType: 'arraybuffer' }))
       ]);
      console.log('DatabaseService: Finished fetching assets.');

      // Create a new PGlite instance with the loaded assets
       this.db = new PGlite({
         wasmModule: await WebAssembly.compile(wasmResponse),
         fsBundle: new Blob([fsResponseArrayBuffer]),
         // dataDir: 'idb://medblock-db' // Removed to use default IndexedDB behavior
       });
      console.log('DatabaseService: PGlite instance created.');

      // Wait for the database to be ready
      console.log('DatabaseService: Waiting for database to be ready...');
      await this.db.waitReady;
      console.log('DatabaseService: Database is ready.');

      // Create the patients table if it doesn't exist
      console.log('DatabaseService: Creating patients table if it does not exist...');
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL,
          diagnosis TEXT,
          admission_date DATE NOT NULL,
          discharge_date DATE,
          room_number TEXT,
          status TEXT NOT NULL
        );
      `);
      console.log('DatabaseService: Patients table creation checked/completed.');

      // Seed the database unconditionally for demonstration
      console.log('DatabaseService: Seeding database...');
      await this.seedDatabase();
      console.log('DatabaseService: Database seeding completed.');

       this.isInitialized = true;
       console.log('DatabaseService: Database initialized successfully');

      // Load patients after initialization and seeding
      console.log('DatabaseService: Calling loadPatients after initialization.');
      await this.loadPatients();

    } catch (error) {
      console.error('DatabaseService: Error during initialization:', error);
      throw error;
    }
  }

  private async seedDatabase(): Promise<void> {
    if (!this.db) {
      console.log('DatabaseService: seedDatabase() called, but db is not available.');
      return;
    }
    console.log('DatabaseService: Starting seedDatabase execution.');
    await this.db.exec(`
      INSERT INTO patients (name, age, gender, diagnosis, admission_date, discharge_date, room_number, status)
      VALUES 
        ('John Doe', 45, 'Male', 'Hypertension', '2024-03-15', NULL, '101', 'Admitted'),
        ('Jane Smith', 38, 'Female', 'Pneumonia', '2024-03-20', NULL, '102', 'Admitted'),
        ('Michael Johnson', 52, 'Male', 'Diabetes', '2024-03-10', '2024-03-18', '103', 'Discharged');
    `);
    console.log('DatabaseService: INSERT queries completed in seedDatabase.');
  }

  private async loadPatients() {
    if (!this.isBrowser || !this.db) {
      console.log('DatabaseService: loadPatients() called, but not in browser or db is not available.');
      return;
    }

    try {
      console.log('DatabaseService: Starting loadPatients execution.');
      console.log('DatabaseService: Executing SELECT query for patients.');
      const result = await this.db.query(`
        SELECT 
          id,
          name,
          age,
          gender,
          diagnosis,
          admission_date as "admissionDate",
          discharge_date as "dischargeDate",
          room_number as "roomNumber",
          status
        FROM patients
        ORDER BY id;
      `);
      
      console.log('DatabaseService: SELECT query completed.');
      console.log('DatabaseService: Data fetched from DB:', result.rows);
      this.patientsSubject.next(result.rows as Patient[]);
      console.log('DatabaseService: patientsSubject updated with fetched data.');
    } catch (error) {
      console.error('DatabaseService: Error loading patients:', error);
      this.patientsSubject.next([]);
    }
  }

  getPatients(): Observable<Patient[]> {
    console.log('DatabaseService: getPatients() called. Ensuring database initialized...');
    // Ensure database is initialized before returning patients
    return from(this.ensureDatabaseInitialized()).pipe(
      switchMap(() => {
        console.log('DatabaseService: ensureDatabaseInitialized completed in getPatients. Returning observable.');
        // Manually trigger loadPatients here to ensure data is loaded after init
        this.loadPatients().catch(error => {
          console.error('DatabaseService: Error in loadPatients triggered by switchMap:', error);
        });
        return this.patientsSubject.asObservable();
      })
    );
  }

  private async ensureDatabaseInitialized(): Promise<void> {
    if (this.isBrowser && this.db && this.isInitialized) {
      console.log('DatabaseService: ensureDatabaseInitialized() called, database already initialized.');
      return;
    }
    console.log('DatabaseService: ensureDatabaseInitialized() called, waiting for initialization.');
    // Wait for initialization to complete if it's in progress
    await this.initialize();
     console.log('DatabaseService: Initialization awaited in ensureDatabaseInitialized.');
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    if (!this.isBrowser || !this.db) {
       console.log(`DatabaseService: getPatientById(${id}) called, but not in browser or db not available.`);
       return undefined;
    }

    console.log(`DatabaseService: getPatientById(${id}) called. Executing query.`);
    try {
      const result = await this.db.query(`
        SELECT 
          id,
          name,
          age,
          gender,
          diagnosis,
          admission_date as "admissionDate",
          discharge_date as "dischargeDate",
          room_number as "roomNumber",
          status
        FROM patients
        WHERE id = $1;
      `, [id]);
      
      console.log(`DatabaseService: SELECT query for id ${id} completed.`, result.rows[0]);
      return result.rows[0] as Patient;
    } catch (error) {
      console.error(`DatabaseService: Error getting patient by id ${id}:`, error);
      return undefined;
    }
  }

  async addPatient(patient: Omit<Patient, 'id'>): Promise<void> {
    if (!this.isBrowser || !this.db) {
      console.log('DatabaseService: addPatient() called, but not in browser or db not available.');
      return;
    }

    console.log('DatabaseService: addPatient() called. Inserting data...', patient);
    try {
      await this.db.query(`
        INSERT INTO patients (
          name, age, gender, diagnosis, admission_date, discharge_date, room_number, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [
        patient.name,
        patient.age,
        patient.gender,
        patient.diagnosis,
        patient.admissionDate,
        patient.dischargeDate,
        patient.roomNumber,
        patient.status
      ]);

      console.log('DatabaseService: Patient added successfully. Reloading patients...');
      await this.loadPatients();
      console.log('DatabaseService: Patients reloaded after adding.');
    } catch (error) {
      console.error('DatabaseService: Error adding patient:', error);
      throw error;
    }
  }

  async updatePatient(patient: Patient): Promise<void> {
    if (!this.isBrowser || !this.db) {
       console.log('DatabaseService: updatePatient() called, but not in browser or db not available.');
       return;
    }

    console.log('DatabaseService: updatePatient() called. Updating data...', patient);
    try {
      await this.db.query(`
        UPDATE patients
        SET 
          name = $1,
          age = $2,
          gender = $3,
          diagnosis = $4,
          admission_date = $5,
          discharge_date = $6,
          room_number = $7,
          status = $8
        WHERE id = $9;
      `, [
        patient.name,
        patient.age,
        patient.gender,
        patient.diagnosis,
        patient.admissionDate,
        patient.dischargeDate,
        patient.roomNumber,
        patient.status,
        patient.id
      ]);

      console.log('DatabaseService: Patient updated successfully. Reloading patients...');
      await this.loadPatients();
      console.log('DatabaseService: Patients reloaded after updating.');
    } catch (error) {
      console.error('DatabaseService: Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: number): Promise<void> {
    if (!this.isBrowser || !this.db) {
      console.log(`DatabaseService: deletePatient(${id}) called, but not in browser or db not available.`);
      return;
    }

    console.log(`DatabaseService: deletePatient(${id}) called. Deleting data...`);
    try {
      await this.db.query('DELETE FROM patients WHERE id = $1;', [id]);
      console.log(`DatabaseService: Patient with id ${id} deleted successfully. Reloading patients...`);
      await this.loadPatients();
      console.log('DatabaseService: Patients reloaded after deleting.');
    } catch (error) {
      console.error(`DatabaseService: Error deleting patient with id ${id}:`, error);
      throw error;
    }
  }
} 