import { Routes } from '@angular/router';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';

export const routes: Routes = [
  { path: '', redirectTo: '/patients', pathMatch: 'full' },
  { path: 'patients', component: PatientListComponent },
  { path: 'patients/add', component: AddPatientComponent },
  { path: 'patients/:id', component: PatientDetailComponent },
  { path: '**', redirectTo: '/patients' }
];
