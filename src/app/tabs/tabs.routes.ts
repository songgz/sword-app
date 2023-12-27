import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import {authGuard} from "../auths/auth.guard";

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'learn',
        loadComponent: () => import('../learn/learn.page').then( m => m.LearnPage),
        canActivate: [authGuard]
      },
      {
        path: 'word',
        loadComponent: () => import('../word/word.page').then( m => m.WordPage),
        canActivate: [authGuard]
      },
      {
        path: 'quiz',
        loadComponent: () => import('../quiz/quiz.page').then( m => m.QuizPage),
        canActivate: [authGuard]
      },
      {
        path: 'quiz-list',
        loadComponent: () => import('../quiz-list/quiz-list.page').then( m => m.QuizListPage),
        canActivate: [authGuard]
      },
      {
        path: 'quiz-detail',
        loadComponent: () => import('../quiz-detail/quiz-detail.page').then( m => m.QuizDetailPage),
        canActivate: [authGuard]
      },
      {
        path: 'quiz-listen',
        loadComponent: () => import('../quiz-listen/quiz-listen.page').then( m => m.QuizListenPage),
        canActivate: [authGuard]
      },
      {
        path: 'quiz-spell',
        loadComponent: () => import('../quiz-spell/quiz-spell.page').then( m => m.QuizSpellPage),
        canActivate: [authGuard]
      },
      {
        path: 'book',
        loadComponent: () => import('../book/book.page').then( m => m.BookPage),
        canActivate: [authGuard]
      },
      {
        path: 'student',
        loadComponent: () => import('../student/student.page').then( m => m.StudentPage),
        canActivate: [authGuard]
      },
      {
        path: 'match-game',
        loadComponent: () => import('../match-game/match-game.page').then( m => m.MatchGamePage),
        canActivate: [authGuard]
      },
      {
        path: 'statistics',
        loadComponent: () => import('../statistics/statistics.page').then( m => m.StatisticsPage)
      },
      {
        path: '',
        redirectTo: '/tabs/learn',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/learn',
    pathMatch: 'full',
  }

];
