import { HttpErrorResponse } from '@angular/common/http';

/** Transforme une erreur HTTP NestJS en message lisible. */
export function messageErreur(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Serveur injoignable. Vérifiez que l’API est démarrée.';
    const msg = err.error?.message;
    if (Array.isArray(msg)) return msg.join(' ');
    if (typeof msg === 'string') return msg;
  }
  return 'Une erreur inattendue est survenue.';
}
