import { StatutRendezVous } from '../../entities/statut-rendez-vous.enum';

export interface RendezVousResponseDto {
  idRendezVous: number;
  statut: StatutRendezVous;
  motif: string | null;
  dateCreation: Date;
  patient: { idPatient: number; nomComplet: string };
  medecin: { idMedecin: number; nomComplet: string };
  cabinet: { idCabinet: number; nom: string; emplacement: string };
  creneau: { idDisponibilite: number; date: string; heureDebut: string; heureFin: string };
}
