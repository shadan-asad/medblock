import { Routes } from '@angular/router';

export const SQL_QUERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/query-editor/query-editor.component').then(m => m.QueryEditorComponent)
  }
]; 