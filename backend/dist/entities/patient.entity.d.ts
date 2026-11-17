import { RendezVous } from './rendez-vous.entity';
export declare class Patient {
    idPatient: number;
    nomComplet: string;
    courriel: string;
    telephone: string | null;
    rendezVous: RendezVous[];
}
