import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientRepository {
  constructor(
    @InjectRepository(Patient) private readonly repo: Repository<Patient>,
  ) {}

  /** `manager` permet de participer à une transaction en cours. */
  trouverParId(
    idPatient: number,
    manager?: EntityManager,
  ): Promise<Patient | null> {
    const repo = manager ? manager.getRepository(Patient) : this.repo;
    return repo.findOne({ where: { idPatient } });
  }

  trouverParCourriel(courriel: string): Promise<Patient | null> {
    return this.repo.findOne({ where: { courriel } });
  }

  creer(donnees: Partial<Patient>): Promise<Patient> {
    return this.repo.save(this.repo.create(donnees));
  }
}
