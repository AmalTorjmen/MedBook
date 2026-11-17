import { Cabinet } from './cabinet.entity';
import { Medecin } from './medecin.entity';
import { RendezVous } from './rendez-vous.entity';
export declare class Disponibilite {
    idDisponibilite: number;
    date: string;
    heureDebut: string;
    heureFin: string;
    idMedecin: number;
    idCabinet: number;
    medecin: Medecin;
    cabinet: Cabinet;
    rendezVous: RendezVous[];
}
