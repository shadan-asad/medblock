import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-query',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss'
})
export class QueryComponent {
  sqlQuery: string = '';
  queryResult: any = null;
  error: string | null = null;
  loading = false;

  constructor(private databaseService: DatabaseService) { }

  async runQuery(): Promise<void> {
    this.queryResult = null;
    this.error = null;
    this.loading = true;

    if (!this.sqlQuery.trim()) {
      this.error = 'Please enter a SQL query.';
      this.loading = false;
      return;
    }

    try {
      const result = await this.databaseService.executeRawQuery(this.sqlQuery);
      console.log('Query result:', result);
      this.queryResult = result;
    } catch (err: any) {
      console.error('Query execution error:', err);
      this.error = err.message || 'An error occurred during query execution.';
    } finally {
      this.loading = false;
    }
  }
}
