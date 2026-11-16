import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Cabinet,
  CriteresRecherche,
  DisponibilitesMedecin,
  MedecinResume,
  Specialite,
} from './models';

@Injectable({ providedIn: 'root' })
export class MedbookApiService {
  private readonly http = inject(HttpClient);

  // ---- UC1 ----
  specialites(): Observable<Specialite[]> {
    return this.http.get<Specialite[]>('/api/specialites');
  }

  cabinets(): Observable<Cabinet[]> {
    return this.http.get<Cabinet[]>('/api/cabinets');
  }

  rechercherMedecins(c: CriteresRecherche): Observable<MedecinResume[]> {
    let params = new HttpParams();
    if (c.nom?.trim()) params = params.set('nom', c.nom.trim());
    if (c.idSpecialite) params = params.set('idSpecialite', c.idSpecialite);
    if (c.idCabinet) params = params.set('idCabinet', c.idCabinet);
    return this.http.get<MedecinResume[]>('/api/medecins', { params });
  }

  disponibilites(idMedecin: number): Observable<DisponibilitesMedecin> {
    return this.http.get<DisponibilitesMedecin>(`/api/medecins/${idMedecin}/disponibilites`);
  }

}
