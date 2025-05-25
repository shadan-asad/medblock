import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DatabaseService } from '../../../../core/services/database.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  error = '';
  currentPhase = 1;
  selectedPatient: Patient | null = null;
  searchTerm = '';
  sortField: keyof Patient = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private async loadPatients(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      this.patients = await this.dbService.getPatients();
      this.sortPatients();
    } catch (err) {
      this.error = 'Error loading patients. Please try again.';
      console.error('Error loading patients:', err);
    } finally {
      this.loading = false;
    }
  }

  onPatientSelect(patient: Patient): void {
    this.selectedPatient = patient;
    this.currentPhase = 2;
  }

  onBackToList(): void {
    this.selectedPatient = null;
    this.currentPhase = 1;
  }

  onViewDetails(patient: Patient): void {
    this.selectedPatient = patient;
    this.currentPhase = 3;
  }

  onBackToSummary(): void {
    this.currentPhase = 2;
  }

  onEditPatient(patient: Patient): void {
    // Navigate to the edit page with the patient ID
    this.router.navigate(['/patients', patient.id, 'edit']);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
  }

  onSort(field: keyof Patient): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortPatients();
  }

  private sortPatients(): void {
    this.patients.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      // Handle date fields
      if (this.sortField === 'createdAt' || this.sortField === 'dateOfBirth') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }

  get filteredPatients(): Patient[] {
    if (!this.searchTerm) return this.patients;
    
    return this.patients.filter(patient => 
      patient.firstName.toLowerCase().includes(this.searchTerm) ||
      patient.lastName.toLowerCase().includes(this.searchTerm) ||
      patient.email.toLowerCase().includes(this.searchTerm) ||
      patient.phone.includes(this.searchTerm)
    );
  }

  getSortIcon(field: keyof Patient): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
}
