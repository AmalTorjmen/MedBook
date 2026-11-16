import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AvatarComponent } from './shared/avatar.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AvatarComponent],
  template: `
    <header class="barre">
      <a routerLink="/" class="logo">Med<span>Book</span></a>
      @if (auth.patient(); as p) {
        <nav>
          <a routerLink="/recherche">Rechercher un médecin</a>
          <span class="qui">
            <app-avatar [nom]="p.nomComplet" [photo]="p.photoUrl" [taille]="34" />
            {{ p.nomComplet }}
          </span>
          <button class="lien" (click)="auth.deconnecter()">Se déconnecter</button>
        </nav>
      }
    </header>
    <main class="page">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
}
