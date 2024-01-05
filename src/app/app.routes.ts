import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./login2/login2.page').then( m => m.Login2Page)
  },
  {
    path: 'student',
    loadComponent: () => import('./student/student.page').then( m => m.StudentPage)
  },
  {
    path: 'vocabulary',
    loadComponent: () => import('./vocabulary/vocabulary.page').then( m => m.VocabularyPage)
  },














];
