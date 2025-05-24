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

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['patients', 'audit_log'], 'readwrite');
      const patientsStore = transaction.objectStore('patients');
      const auditStore = transaction.objectStore('audit_log');

      const patientData = {
        ...patient,
        createdAt: new Date()
      };

      const addRequest = patientsStore.add(patientData);

      addRequest.onsuccess = (event) => {
        const patientId = (event.target as IDBRequest).result;
        
        // Add audit log entry
        const auditEntry = {
          action: 'INSERT',
          tableName: 'patients',
          recordId: patientId,
          changes: JSON.stringify(patient),
          createdAt: new Date()
        };

        auditStore.add(auditEntry);
      };

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        console.error('Error adding patient:', event);
        reject(new Error('Failed to add patient'));
      };
    });
  }

  async getPatients(): Promise<Patient[]> {
    await this.waitForInitialization();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['patients'], 'readonly');
      const store = transaction.objectStore('patients');
      const index = store.index('created_at');
      const request = index.openCursor(null, 'prev');

      const patients: Patient[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          patients.push(cursor.value);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        resolve(patients);
      };

      transaction.onerror = (event) => {
        console.error('Error getting patients:', event);
        reject(new Error('Failed to get patients'));
      };
    });
  }

  isInitialized(): Observable<boolean> {
    return this.dbInitialized.asObservable();
  }
} 