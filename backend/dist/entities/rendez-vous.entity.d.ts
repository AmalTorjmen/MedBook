import { Disponibilite } from './disponibilite.entity';
import { Patient } from './patient.entity';
import { StatutRendezVous } from './statut-rendez-vous.enum';
export declare class RendezVous {
    idRendezVous: number;
    dateCreation: Date;
    statut: StatutRendezVous;
    motif: string | null;
    idPatient: number;
    idDisponibilite: number;
    creneauConfirmeId: number | null;
    patient: Patient;
    disponibilite: Disponibilite;
}
