import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'patients',
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  },
  {
    path: 'sql-query',
    loadChildren: () => import('./features/sql-query/sql-query.routes').then(m => m.SQL_QUERY_ROUTES)
  }
];
