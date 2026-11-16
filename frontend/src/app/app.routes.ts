import { Routes } from '@angular/router';
import { authGuard, inviteGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'recherche' },
  {
    path: 'connexion',
    canActivate: [inviteGuard],
    loadComponent: () => import('./pages/connexion/connexion.component').then((m) => m.ConnexionComponent),
  },
  {
    path: 'inscription',
    canActivate: [inviteGuard],
    loadComponent: () => import('./pages/inscription/inscription.component').then((m) => m.InscriptionComponent),
  },
  {
    // UC1
    path: 'recherche',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/recherche/recherche.component').then((m) => m.RechercheComponent),
  },
  { path: '**', redirectTo: 'recherche' },
];
