import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifierJeton } from '../../auth/token.util';

/**
 * Garde d'authentification : lit `Authorization: Bearer <jeton>` (JWT HS256)
 * et place l'identifiant du patient dans `request.patientId`.
 *
 * Hors production, l'ancien en-tête `x-patient-id` reste accepté pour les tests
 * existants (e2e UC2) ; il est refusé quand NODE_ENV=production.
 */
@Injectable()
export class PatientContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const auth: string | undefined = request.headers['authorization'];
    if (auth?.startsWith('Bearer ')) {
      const payload = verifierJeton(auth.slice(7).trim());
      if (!payload) {
        throw new UnauthorizedException('Session expirée ou invalide.');
      }
      request.patientId = payload.sub;
      return true;
    }

    if (process.env.NODE_ENV !== 'production') {
      const header = request.headers['x-patient-id'];
      const id = Number(Array.isArray(header) ? header[0] : header);
      if (Number.isInteger(id) && id > 0) {
        request.patientId = id;
        return true;
      }
    }

    throw new UnauthorizedException('Authentification requise : patient non identifié.');
  }
}
