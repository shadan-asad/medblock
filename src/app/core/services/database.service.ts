import { Injectable } from '@angular/core';
import { PGlite } from '@electric-sql/pglite';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: PGlite;
  private dbInitialized = new BehaviorSubject<boolean>(false);

  constructor() {
    this.db = new PGlite();
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Create patients table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          date_of_birth DATE NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          medical_history TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create audit log table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id SERIAL PRIMARY KEY,
          table_name VARCHAR(100) NOT NULL,
          record_id INTEGER NOT NULL,
          action VARCHAR(10) NOT NULL,
          changes JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      this.dbInitialized.next(true);
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async executeQuery(query: string, params: any[] = []): Promise<any> {
    try {
      const result = await this.db.query(query, params);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  isInitialized(): Observable<boolean> {
    return this.dbInitialized.asObservable();
  }
} 