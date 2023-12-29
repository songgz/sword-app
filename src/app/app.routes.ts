import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'student',
    loadComponent: () => import('./student/student.page').then( m => m.StudentPage)
  },
  {
    path: 'tab1',
    loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page),
  },
  {
    path: 'tab2',
    loadComponent: () => import('./tab2/tab2.page').then((m) => m.Tab2Page),
  },
  {
    path: 'tab3',
    loadComponent: () => import('./tab3/tab3.page').then((m) => m.Tab3Page),
  },  {
    path: 'login2',
    loadComponent: () => import('./login2/login2.page').then( m => m.Login2Page)
  },













];
