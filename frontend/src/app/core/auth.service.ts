import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { PatientSession, Session } from './models';

const CLE = 'medbook.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<Session | null>(this.lire());

  readonly patient = computed<PatientSession | null>(() => this.session()?.patient ?? null);
  readonly estConnecte = computed(() => this.session() !== null);

  get jeton(): string | null {
    return this.session()?.jeton ?? null;
  }

  connecter(courriel: string, motDePasse: string): Observable<Session> {
    return this.http
      .post<Session>('/api/auth/connexion', { courriel, motDePasse })
      .pipe(tap((s) => this.enregistrer(s)));
  }

  inscrire(donnees: { nomComplet: string; courriel: string; telephone?: string; motDePasse: string }): Observable<Session> {
    return this.http.post<Session>('/api/auth/inscription', donnees).pipe(tap((s) => this.enregistrer(s)));
  }

  deconnecter(): void {
    sessionStorage.removeItem(CLE);
    this.session.set(null);
    void this.router.navigate(['/connexion']);
  }

  private enregistrer(s: Session): void {
    sessionStorage.setItem(CLE, JSON.stringify(s));
    this.session.set(s);
  }

  private lire(): Session | null {
    try {
      const brut = sessionStorage.getItem(CLE);
      if (!brut) return null;
      const s = JSON.parse(brut) as Session;
      // Expiration lue dans le payload du JWT
      const exp = JSON.parse(atob(s.jeton.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp;
      return exp * 1000 > Date.now() ? s : null;
    } catch {
      return null;
    }
  }
}
