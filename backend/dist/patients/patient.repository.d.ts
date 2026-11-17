import { EntityManager, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
export declare class PatientRepository {
    private readonly repo;
    constructor(repo: Repository<Patient>);
    trouverParId(idPatient: number, manager?: EntityManager): Promise<Patient | null>;
}
