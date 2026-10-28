import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RendezVous } from '../entities/rendez-vous.entity';
import { StatutRendezVous } from '../entities/statut-rendez-vous.enum';

@Injectable()
export class RendezVousRepository {
  constructor(
    @InjectRepository(RendezVous) private readonly repo: Repository<RendezVous>,
  ) {}

  private repoDe(manager?: EntityManager): Repository<RendezVous> {
    return manager ? manager.getRepository(RendezVous) : this.repo;
  }

  /** Vrai si le créneau possède déjà un rendez-vous au statut CONFIRME. */
  async existeReservationConfirmee(
    idDisponibilite: number,
    manager?: EntityManager,
  ): Promise<boolean> {
    const nombre = await this.repoDe(manager).count({
      where: { idDisponibilite, statut: StatutRendezVous.CONFIRME },
    });
    return nombre > 0;
  }

  enregistrer(
    donnees: Pick<RendezVous, 'idPatient' | 'idDisponibilite' | 'motif'>,
    manager?: EntityManager,
  ): Promise<RendezVous> {
    const repo = this.repoDe(manager);
    const rdv = repo.create({
      ...donnees,
      statut: StatutRendezVous.CONFIRME,
    });
    return repo.save(rdv);
  }

  /** Charge le rendez-vous avec patient, créneau, médecin et cabinet. */
  trouverParIdDetaille(
    idRendezVous: number,
    manager?: EntityManager,
  ): Promise<RendezVous | null> {
    return this.repoDe(manager).findOne({
      where: { idRendezVous },
      relations: {
        patient: true,
        disponibilite: { medecin: true, cabinet: true },
      },
    });
  }
}
