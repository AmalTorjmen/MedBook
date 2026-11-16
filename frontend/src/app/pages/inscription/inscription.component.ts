import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { messageErreur } from '../../core/erreur';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="carte etroite">
      <h1>Créer un compte patient</h1>

      <form [formGroup]="form" (ngSubmit)="valider()" novalidate>
        <label>Nom complet <input formControlName="nomComplet" autocomplete="name" /></label>
        @if (invalide('nomComplet')) { <small class="err">Le nom est obligatoire.</small> }

        <label>Courriel <input type="email" formControlName="courriel" autocomplete="email" /></label>
        @if (invalide('courriel')) { <small class="err">Saisissez un courriel valide.</small> }

        <label>Téléphone <span class="facultatif">(facultatif)</span>
          <input type="tel" formControlName="telephone" autocomplete="tel" />
        </label>

        <label>Mot de passe
          <input type="password" formControlName="motDePasse" autocomplete="new-password" />
        </label>
        @if (invalide('motDePasse')) { <small class="err">Au moins 8 caractères.</small> }

        @if (erreur()) { <div class="alerte erreur">{{ erreur() }}</div> }

        <button type="submit" class="principal" [disabled]="chargement()">
          {{ chargement() ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>
      <p class="bas">Déjà inscrit ? <a routerLink="/connexion">Se connecter</a></p>
    </section>
  `,
})
export class InscriptionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly chargement = signal(false);
  readonly erreur = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nomComplet: ['', [Validators.required, Validators.maxLength(150)]],
    courriel: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.maxLength(30)],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });

  invalide(champ: 'nomComplet' | 'courriel' | 'telephone' | 'motDePasse'): boolean {
    const c = this.form.controls[champ];
    return c.touched && c.invalid;
  }

  valider(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.chargement.set(true);
    this.erreur.set(null);
    const v = this.form.getRawValue();
    this.auth
      .inscrire({ ...v, telephone: v.telephone.trim() || undefined })
      .subscribe({
        next: () => void this.router.navigate(['/recherche']),
        error: (e) => {
          this.erreur.set(messageErreur(e));
          this.chargement.set(false);
        },
      });
  }
}
