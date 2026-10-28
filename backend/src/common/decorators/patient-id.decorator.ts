import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extrait l'identifiant du patient authentifié placé par le garde sur la requête. */
export const PatientId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number =>
    context.switchToHttp().getRequest().patientId,
);
