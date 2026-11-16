import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Ajoute le jeton JWT et déconnecte si l'API répond 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const jeton = auth.jeton;
  const requete = jeton ? req.clone({ setHeaders: { Authorization: `Bearer ${jeton}` } }) : req;

  return next(requete).pipe(
    catchError((err) => {
      if (err.status === 401 && jeton && !req.url.includes('/auth/')) {
        auth.deconnecter();
      }
      return throwError(() => err);
    }),
  );
};
