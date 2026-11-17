import { Disponibilite } from './disponibilite.entity';
import { Specialite } from './specialite.entity';
export declare class Medecin {
    idMedecin: number;
    nomComplet: string;
    courriel: string;
    idSpecialite: number;
    specialite: Specialite;
    disponibilites: Disponibilite[];
}
