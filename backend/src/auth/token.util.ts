import { createHmac, timingSafeEqual } from 'crypto';

/**
 * JWT HS256 minimal (module crypto natif).
 * Secret : variable d'environnement JWT_SECRET.
 */
export interface JetonPayload {
  sub: number; // idPatient
  courriel: string;
  exp: number; // secondes epoch
}

const DUREE_SECONDES = 8 * 60 * 60; // 8 h

function secret(): string {
  return process.env.JWT_SECRET ?? 'medbook-secret-dev-a-changer';
}

const b64url = (data: Buffer | string) => Buffer.from(data).toString('base64url');

function signer(contenu: string): string {
  return createHmac('sha256', secret()).update(contenu).digest('base64url');
}

export function genererJeton(idPatient: number, courriel: string): string {
  const entete = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: JetonPayload = {
    sub: idPatient,
    courriel,
    exp: Math.floor(Date.now() / 1000) + DUREE_SECONDES,
  };
  const corps = b64url(JSON.stringify(payload));
  return `${entete}.${corps}.${signer(`${entete}.${corps}`)}`;
}

/** Renvoie le payload si le jeton est valide et non expiré, sinon null. */
export function verifierJeton(jeton: string): JetonPayload | null {
  const parties = jeton.split('.');
  if (parties.length !== 3) return null;
  const [entete, corps, signature] = parties;
  const attendue = Buffer.from(signer(`${entete}.${corps}`));
  const recue = Buffer.from(signature);
  if (attendue.length !== recue.length || !timingSafeEqual(attendue, recue)) return null;
  try {
    const payload = JSON.parse(Buffer.from(corps, 'base64url').toString()) as JetonPayload;
    if (!Number.isInteger(payload.sub) || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
