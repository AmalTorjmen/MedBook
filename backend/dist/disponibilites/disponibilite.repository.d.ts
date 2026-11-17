import { EntityManager, Repository } from 'typeorm';
import { Disponibilite } from '../entities/disponibilite.entity';
export declare class DisponibiliteRepository {
    private readonly repo;
    constructor(repo: Repository<Disponibilite>);
    trouverParId(idDisponibilite: number, manager?: EntityManager): Promise<Disponibilite | null>;
    trouverParIdAvecVerrou(idDisponibilite: number, manager: EntityManager): Promise<Disponibilite | null>;
}
