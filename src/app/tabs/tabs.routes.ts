import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'learn',
        loadComponent: () => import('../learn/learn.page').then( m => m.LearnPage)
      },
      {
        path: 'word',
        loadComponent: () => import('../word/word.page').then( m => m.WordPage)
      },
      {
        path: 'book',
        loadComponent: () => import('../book/book.page').then( m => m.BookPage)
      },
      {
        path: 'tab1',
        loadComponent: () => import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () => import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () => import('../tab3/tab3.page').then((m) => m.Tab3Page),
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
  },
];
