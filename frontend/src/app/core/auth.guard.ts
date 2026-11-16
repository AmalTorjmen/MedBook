import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Pages réservées au patient connecté (préconditions UC1 / UC2). */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estConnecte() || inject(Router).createUrlTree(['/connexion']);
};

/** Connexion / inscription : inutile si déjà connecté. */
export const inviteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return !auth.estConnecte() || inject(Router).createUrlTree(['/recherche']);
};
