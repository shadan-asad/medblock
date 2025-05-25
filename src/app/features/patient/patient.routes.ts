import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/patient-details/patient-details.component').then(m => m.PatientDetailsComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  }
]; 