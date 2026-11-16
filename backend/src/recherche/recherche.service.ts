import { Injectable, NotFoundException } from '@nestjs/common';
import { DisponibiliteRepository } from '../disponibilites/disponibilite.repository';
import { RechercheMedecinDto } from './dto/recherche-medecin.dto';
import { MedecinRepository } from './medecin.repository';

export interface MedecinResumeDto {
  idMedecin: number;
  nomComplet: string;
  courriel: string;
  photoUrl: string | null;
  specialite: { idSpecialite: number; nom: string };
}

export interface CreneauLibreDto {
  idDisponibilite: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  cabinet: { idCabinet: number; nom: string; emplacement: string };
}

/** Couche métier de l'UC1 – Rechercher un médecin et consulter ses disponibilités. */
@Injectable()
export class RechercheService {
  constructor(
    private readonly medecins: MedecinRepository,
    private readonly disponibilites: DisponibiliteRepository,
  ) {}

  async rechercherMedecins(criteres: RechercheMedecinDto): Promise<MedecinResumeDto[]> {
    const resultats = await this.medecins.rechercher(criteres);
    return resultats.map((m) => ({
      idMedecin: m.idMedecin,
      nomComplet: m.nomComplet,
      courriel: m.courriel,
      photoUrl: m.photoUrl,
      specialite: { idSpecialite: m.specialite.idSpecialite, nom: m.specialite.nom },
    }));
  }

  async disponibilitesDuMedecin(idMedecin: number): Promise<{
    medecin: MedecinResumeDto;
    creneaux: CreneauLibreDto[];
  }> {
    const m = await this.medecins.trouverParId(idMedecin);
    if (!m) throw new NotFoundException('Médecin introuvable.');
    const creneaux = await this.disponibilites.rechercherLibresPourMedecin(idMedecin);
    return {
      medecin: {
        idMedecin: m.idMedecin,
        nomComplet: m.nomComplet,
        courriel: m.courriel,
      photoUrl: m.photoUrl,
        specialite: { idSpecialite: m.specialite.idSpecialite, nom: m.specialite.nom },
      },
      creneaux: creneaux.map((d) => ({
        idDisponibilite: d.idDisponibilite,
        date: d.date,
        heureDebut: d.heureDebut,
        heureFin: d.heureFin,
        cabinet: { idCabinet: d.cabinet.idCabinet, nom: d.cabinet.nom, emplacement: d.cabinet.emplacement },
      })),
    };
  }

  specialites() {
    return this.medecins.toutesSpecialites();
  }

  cabinets() {
    return this.medecins.tousCabinets();
  }
}
