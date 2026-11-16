import { Component, computed, input, signal } from '@angular/core';

/**
 * Avatar d'une personne.
 * - Si `photo` est fournie et se charge : affiche la photo.
 * - Sinon : avatar illustré généré (SVG), stable pour un même nom.
 *   Les médecins portent une blouse blanche et un stéthoscope.
 */
@Component({
  selector: 'app-avatar',
  template: `
    <img
      class="avatar-img"
      [src]="photoValide() ? photo()! : svg()"
      [alt]="'Photo de ' + nom()"
      [style.width.px]="taille()"
      [style.height.px]="taille()"
      (error)="echec.set(true)"
    />
  `,
  styles: `
    .avatar-img { border-radius: 50%; object-fit: cover; display: block; flex-shrink: 0;
      box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(15, 40, 80, .15); background: #e3edfd; }
  `,
})
export class AvatarComponent {
  readonly nom = input.required<string>();
  readonly photo = input<string | null | undefined>(null);
  readonly role = input<'medecin' | 'patient'>('patient');
  readonly taille = input(56);

  readonly echec = signal(false);
  readonly photoValide = computed(() => !!this.photo() && !this.echec());

  readonly svg = computed(() => {
    const h = hash(this.nom());
    const pick = <T>(arr: T[], k: number) => arr[Math.floor(h / k) % arr.length];

    const fond = pick(['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#e0e7ff', '#ccfbf1', '#ffedd5'], 1);
    const peau = pick(['#f5d0b5', '#e8b896', '#d29b74', '#b97c56', '#8d5a3b', '#f1c7a4'], 7);
    const cheveux = pick(['#2b1d14', '#4a3222', '#1a1a1a', '#6b4423', '#8a6a4a', '#3d2a1e'], 13);
    const coupe = Math.floor(h / 17) % 3; // 0 court, 1 long, 2 hijab
    const medecin = this.role() === 'medecin';
    const habit = medecin ? '#ffffff' : pick(['#1f6feb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be185d'], 19);
    const voile = pick(['#1f3a5f', '#7c2d12', '#4c1d95', '#0f766e', '#9f1239'], 23);

    const cheveuxArriere =
      coupe === 1 ? `<path d="M30 46 Q28 22 50 20 Q72 22 70 46 L72 70 L28 70 Z" fill="${cheveux}"/>` :
      coupe === 2 ? `<path d="M26 52 Q24 18 50 17 Q76 18 74 52 L78 80 L22 80 Z" fill="${voile}"/>` : '';
    const cheveuxAvant =
      coupe === 2 ? `<path d="M33 40 Q34 25 50 24 Q66 25 67 40 Q60 31 50 31 Q40 31 33 40 Z" fill="${voile}"/>` :
      `<path d="M33 40 Q32 22 50 22 Q68 22 67 40 Q62 30 50 30 Q38 30 33 40 Z" fill="${cheveux}"/>`;

    const corps = medecin
      ? `<path d="M14 100 Q16 72 50 68 Q84 72 86 100 Z" fill="${habit}" stroke="#cbd5e1" stroke-width="1"/>
         <path d="M42 69 L50 84 L58 69" fill="#93c5fd"/>
         <path d="M40 70 Q36 86 44 92" stroke="#334155" stroke-width="2.2" fill="none"/>
         <circle cx="45" cy="93" r="3" fill="#334155"/>
         <path d="M43 76 L38 100 M57 76 L62 100" stroke="#cbd5e1" stroke-width="1.2"/>`
      : `<path d="M14 100 Q16 72 50 68 Q84 72 86 100 Z" fill="${habit}"/>
         <path d="M43 69 Q50 76 57 69" fill="${peau}"/>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${fond}"/>
      ${cheveuxArriere}
      <rect x="44" y="56" width="12" height="14" rx="4" fill="${peau}"/>
      ${corps}
      <ellipse cx="50" cy="44" rx="16" ry="18" fill="${peau}"/>
      <circle cx="44" cy="45" r="1.8" fill="#1f2937"/>
      <circle cx="56" cy="45" r="1.8" fill="#1f2937"/>
      <path d="M45 53 Q50 57 55 53" stroke="#9a3412" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${cheveuxAvant}
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Math.abs(h);
}
