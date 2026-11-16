import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { messageErreur } from '../../core/erreur';

@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="carte etroite">
      <h1>Connexion</h1>
      <p class="sous">Accédez à votre espace patient pour prendre rendez-vous.</p>

      <form [formGroup]="form" (ngSubmit)="valider()" novalidate>
        <label>Courriel
          <input type="email" formControlName="courriel" autocomplete="email" />
        </label>
        @if (form.controls.courriel.touched && form.controls.courriel.invalid) {
          <small class="err">Saisissez un courriel valide.</small>
        }

        <label>Mot de passe
          <input type="password" formControlName="motDePasse" autocomplete="current-password" />
        </label>
        @if (form.controls.motDePasse.touched && form.controls.motDePasse.invalid) {
          <small class="err">Le mot de passe est obligatoire.</small>
        }

        @if (erreur()) { <div class="alerte erreur">{{ erreur() }}</div> }

        <button type="submit" class="principal" [disabled]="chargement()">
          {{ chargement() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
      <p class="bas">Pas encore de compte ? <a routerLink="/inscription">Créer un compte</a></p>
    </section>
  `,
})
export class ConnexionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly chargement = signal(false);
  readonly erreur = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    courriel: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  valider(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.chargement.set(true);
    this.erreur.set(null);
    const { courriel, motDePasse } = this.form.getRawValue();
    this.auth.connecter(courriel, motDePasse).subscribe({
      next: () => void this.router.navigate(['/recherche']),
      error: (e) => {
        this.erreur.set(messageErreur(e));
        this.chargement.set(false);
      },
    });
  }
}
