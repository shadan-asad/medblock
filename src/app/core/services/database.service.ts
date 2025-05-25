import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../../features/patient/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: IDBDatabase | null = null;
  private dbInitialized = new BehaviorSubject<boolean>(false);
  private readonly DB_NAME = 'medblock_db';
  private readonly DB_VERSION = 1;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening database:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.dbInitialized.next(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create patients store
      if (!db.objectStoreNames.contains('patients')) {
        const patientsStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
        patientsStore.createIndex('email', 'email', { unique: true });
        patientsStore.createIndex('created_at', 'createdAt', { unique: false });
      }

      // Create audit_log store
      if (!db.objectStoreNames.contains('audit_log')) {
        const auditStore = db.createObjectStore('audit_log', { keyPath: 'id', autoIncrement: true });
        auditStore.createIndex('record_id', 'recordId', { unique: false });
        auditStore.createIndex('created_at', 'createdAt', { unique: false });
      }
    };
  }

  private async waitForInitialization(): Promise<void> {
    if (!this.dbInitialized.value) {
      return new Promise<void>((resolve) => {
        this.dbInitialized.subscribe(initialized => {
          if (initialized) {
            resolve();
          }
        });
      });
    }
  }

  async addPatient(patient: Patient): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readwrite');
      const store = transaction.objectStore('patients');

      // Remove the id field to let IndexedDB auto-generate it
      const { id, ...patientWithoutId } = patient;

      // Log the data we're trying to store
      console.log('Attempting to store patient data:', patientWithoutId);

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'address'];
      const missingFields = requiredFields.filter(field => !patientWithoutId[field as keyof typeof patientWithoutId]);
      
      if (missingFields.length > 0) {
        reject(new Error(`Missing required fields: ${missingFields.join(', ')}`));
        return;
      }

      const request = store.add(patientWithoutId);

      request.onsuccess = () => {
        const patientId = request.result as number;
        console.log('Successfully added patient with ID:', patientId);
        this.logAudit('CREATE', 'patients', patientId);
        resolve();
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error('Error adding patient:', {
          error,
          errorName: error?.name,
          errorMessage: error?.message,
          patientData: patientWithoutId
        });
        
        // Handle specific IndexedDB errors
        if (error?.name === 'ConstraintError') {
          reject(new Error('A patient with this email already exists'));
        } else {
          reject(new Error(`Error adding patient: ${error?.message || 'Unknown error'}`));
        }
      };
    });
  }

  async updatePatient(patient: Patient): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    if (!patient.id) {
      throw new Error('Patient ID is required for update');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readwrite');
      const store = transaction.objectStore('patients');

      // First, check if the patient exists
      const getRequest = store.get(patient.id as number);

      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('Patient not found'));
          return;
        }

        // Preserve the original createdAt date
        const updatedPatient = {
          ...patient,
          createdAt: getRequest.result.createdAt
        };

        const updateRequest = store.put(updatedPatient);

        updateRequest.onsuccess = () => {
          this.logAudit('UPDATE', 'patients', patient.id!);
          resolve();
        };

        updateRequest.onerror = (event) => {
          console.error('Error updating patient:', event);
          reject(new Error('Error updating patient'));
        };
      };

      getRequest.onerror = (event) => {
        console.error('Error checking patient:', event);
        reject(new Error('Error checking patient'));
      };
    });
  }

  async getPatientById(id: number): Promise<Patient | null> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');

      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        console.error('Error getting patient:', event);
        reject(new Error('Error getting patient'));
      };
    });
  }

  async getPatients(): Promise<Patient[]> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting patients:', event);
        reject(new Error('Error getting patients'));
      };
    });
  }

  private async logAudit(action: string, table: string, recordId: number): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const auditEntry = {
      action,
      table,
      recordId,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit_log'], 'readwrite');
      const store = transaction.objectStore('audit_log');

      const request = store.add(auditEntry);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error logging audit entry:', event);
        reject(new Error('Error logging audit entry'));
      };
    });
  }

  isInitialized(): Observable<boolean> {
    return this.dbInitialized.asObservable();
  }
} 