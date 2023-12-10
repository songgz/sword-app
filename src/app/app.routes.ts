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
    path: 'quiz-alert',
    loadComponent: () => import('./quiz-alert/quiz-alert.component').then( m => m.QuizAlertComponent)
  },  {
    path: 'match-game',
    loadComponent: () => import('./match-game/match-game.page').then( m => m.MatchGamePage)
  },
  {
    path: 'quiz-list',
    loadComponent: () => import('./quiz-list/quiz-list.page').then( m => m.QuizListPage)
  },
  {
    path: 'quiz-detail',
    loadComponent: () => import('./quiz-detail/quiz-detail.page').then( m => m.QuizDetailPage)
  },






];
