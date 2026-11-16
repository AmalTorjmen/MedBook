export interface PatientSession {
  idPatient: number;
  nomComplet: string;
  courriel: string;
  photoUrl?: string | null;
}

export interface Session {
  jeton: string;
  patient: PatientSession;
}

export interface Specialite {
  idSpecialite: number;
  nom: string;
  description?: string | null;
}

export interface Cabinet {
  idCabinet: number;
  nom: string;
  emplacement: string;
}

export interface MedecinResume {
  idMedecin: number;
  nomComplet: string;
  courriel: string;
  photoUrl?: string | null;
  specialite: { idSpecialite: number; nom: string };
}

export interface CreneauLibre {
  idDisponibilite: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  cabinet: Cabinet;
}

export interface DisponibilitesMedecin {
  medecin: MedecinResume;
  creneaux: CreneauLibre[];
}

export interface CriteresRecherche {
  nom?: string;
  idSpecialite?: number | null;
  idCabinet?: number | null;
}

export interface RendezVous {
  idRendezVous: number;
  statut: 'CONFIRME' | 'ANNULE';
  motif: string | null;
  dateCreation: string;
  patient: { idPatient: number; nomComplet: string };
  medecin: { idMedecin: number; nomComplet: string };
  cabinet: Cabinet;
  creneau: { idDisponibilite: number; date: string; heureDebut: string; heureFin: string };
}
