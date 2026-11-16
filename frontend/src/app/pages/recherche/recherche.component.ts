import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { messageErreur } from '../../core/erreur';
import { MedbookApiService } from '../../core/medbook-api.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { Cabinet, MedecinResume, Specialite } from '../../core/models';

/** UC1 – Rechercher un médecin (nom, spécialité, cabinet). */
@Component({
  selector: 'app-recherche',
  imports: [ReactiveFormsModule, RouterLink, AvatarComponent],
  template: `
    <h1>Rechercher un médecin</h1>

    <form class="carte filtres" [formGroup]="form" (ngSubmit)="rechercher()">
      <label>Nom du médecin
        <input formControlName="nom" placeholder="ex. Ben Ali" />
      </label>
      <label>Spécialité
        <select formControlName="idSpecialite">
          <option [ngValue]="null">Toutes</option>
          @for (s of specialites(); track s.idSpecialite) {
            <option [ngValue]="s.idSpecialite">{{ s.nom }}</option>
          }
        </select>
      </label>
      <label>Cabinet
        <select formControlName="idCabinet">
          <option [ngValue]="null">Tous</option>
          @for (c of cabinets(); track c.idCabinet) {
            <option [ngValue]="c.idCabinet">{{ c.nom }}</option>
          }
        </select>
      </label>
      <div class="actions">
        <button type="submit" class="principal" [disabled]="chargement()">Rechercher</button>
        <button type="button" class="secondaire" (click)="reinitialiser()">Effacer</button>
      </div>
    </form>

    @if (erreur()) { <div class="alerte erreur">{{ erreur() }}</div> }

    @if (chargement()) {
      <p class="info">Recherche en cours…</p>
    } @else {
      @if (resultats(); as liste) {
      @if (liste.length === 0) {
        <div class="alerte">Aucun médecin ne correspond à ces critères.</div>
      } @else {
        <p class="info">{{ liste.length }} médecin(s) trouvé(s)</p>
        <ul class="grille">
          @for (m of liste; track m.idMedecin) {
            <li class="carte medecin">
              <div class="medecin-tete">
                <app-avatar [nom]="m.nomComplet" [photo]="m.photoUrl" role="medecin" [taille]="72" />
                <div>
                  <h2>{{ m.nomComplet }}</h2>
                  <span class="badge">{{ m.specialite.nom }}</span>
                </div>
              </div>
              <a class="principal bouton" [routerLink]="['/reservation', m.idMedecin]">
                Voir les disponibilités
              </a>
            </li>
          }
        </ul>
      }
      }
    }
  `,
})
export class RechercheComponent implements OnInit {
  private readonly api = inject(MedbookApiService);
  private readonly fb = inject(FormBuilder);

  readonly specialites = signal<Specialite[]>([]);
  readonly cabinets = signal<Cabinet[]>([]);
  readonly resultats = signal<MedecinResume[] | null>(null);
  readonly chargement = signal(false);
  readonly erreur = signal<string | null>(null);

  readonly form = this.fb.group({
    nom: [''],
    idSpecialite: [null as number | null],
    idCabinet: [null as number | null],
  });

  ngOnInit(): void {
    this.api.specialites().subscribe({ next: (s) => this.specialites.set(s) });
    this.api.cabinets().subscribe({ next: (c) => this.cabinets.set(c) });
    this.rechercher();
  }

  rechercher(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    const v = this.form.getRawValue();
    this.api
      .rechercherMedecins({ nom: v.nom ?? '', idSpecialite: v.idSpecialite, idCabinet: v.idCabinet })
      .subscribe({
        next: (r) => {
          this.resultats.set(r);
          this.chargement.set(false);
        },
        error: (e) => {
          this.erreur.set(messageErreur(e));
          this.chargement.set(false);
        },
      });
  }

  reinitialiser(): void {
    this.form.reset({ nom: '', idSpecialite: null, idCabinet: null });
    this.rechercher();
  }
}
