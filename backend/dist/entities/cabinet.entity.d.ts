import { Disponibilite } from './disponibilite.entity';
export declare class Cabinet {
    idCabinet: number;
    nom: string;
    emplacement: string;
    disponibilites: Disponibilite[];
}
