import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Garde TEMPORAIRE : l'authentification (JWT) n'est pas dans le périmètre de l'UC2.
 * Elle simule un patient authentifié via l'en-tête `x-patient-id`.
 *
 * À l'intégration : remplacer par le JwtAuthGuard commun, qui doit placer
 * l'identifiant du patient dans `request.patientId` (le décorateur @PatientId()
 * et le contrôleur n'ont alors pas besoin de changer).
 */
@Injectable()
export class PatientContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers['x-patient-id'];
    const id = Number(Array.isArray(header) ? header[0] : header);

    if (!Number.isInteger(id) || id <= 0) {
      throw new UnauthorizedException(
        'Authentification requise : patient non identifié.',
      );
    }
    request.patientId = id;
    return true;
  }
}
