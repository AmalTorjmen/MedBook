import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/** Hash scrypt au format « sel:hash » (module crypto natif, aucune dépendance). */
export function hasherMotDePasse(motDePasse: string): string {
  const sel = randomBytes(16).toString('hex');
  return `${sel}:${scryptSync(motDePasse, sel, 64).toString('hex')}`;
}

export function verifierMotDePasse(motDePasse: string, stocke: string | null): boolean {
  if (!stocke || !stocke.includes(':')) return false;
  const [sel, hash] = stocke.split(':');
  const attendu = Buffer.from(hash, 'hex');
  const calcule = scryptSync(motDePasse, sel, 64);
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}
