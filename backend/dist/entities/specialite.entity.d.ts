import { Medecin } from './medecin.entity';
export declare class Specialite {
    idSpecialite: number;
    nom: string;
    description: string | null;
    medecins: Medecin[];
}
