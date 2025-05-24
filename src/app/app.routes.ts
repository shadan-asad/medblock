import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'patients',
    pathMatch: 'full'
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
