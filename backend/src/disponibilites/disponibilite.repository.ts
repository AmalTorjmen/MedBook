import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Disponibilite } from '../entities/disponibilite.entity';

/**
 * Repository partagé entre UC1 (recherche), UC2 (réservation) et UC4 (gestion).
 * UC1 ajoutera ici `rechercherPourMedecin(idMedecin, date)` à l'intégration.
 */
@Injectable()
export class DisponibiliteRepository {
  constructor(
    @InjectRepository(Disponibilite)
    private readonly repo: Repository<Disponibilite>,
  ) {}

  trouverParId(
    idDisponibilite: number,
    manager?: EntityManager,
  ): Promise<Disponibilite | null> {
    const repo = manager ? manager.getRepository(Disponibilite) : this.repo;
    return repo.findOne({ where: { idDisponibilite } });
  }

  /**
   * Lit le créneau avec un verrou pessimiste (SELECT ... FOR UPDATE).
   * Doit être appelé dans une transaction : les réservations concurrentes
   * du même créneau sont alors sérialisées.
   */
  trouverParIdAvecVerrou(
    idDisponibilite: number,
    manager: EntityManager,
  ): Promise<Disponibilite | null> {
    return manager.getRepository(Disponibilite).findOne({
      where: { idDisponibilite },
      lock: { mode: 'pessimistic_write' },
    });
  }

  /** UC1 : créneaux futurs et libres (aucun rendez-vous CONFIRME) d'un médecin. */
  rechercherLibresPourMedecin(idMedecin: number): Promise<Disponibilite[]> {
    return this.repo
      .createQueryBuilder('d')
      .innerJoinAndSelect('d.cabinet', 'c')
      .leftJoin('d.rendezVous', 'rv', 'rv.statut = :confirme', { confirme: 'CONFIRME' })
      .where('d.idMedecin = :idMedecin', { idMedecin })
      .andWhere('rv.idRendezVous IS NULL')
      .andWhere('TIMESTAMP(d.date, d.heure_debut) > NOW()')
      .orderBy('d.date', 'ASC')
      .addOrderBy('d.heureDebut', 'ASC')
      .getMany();
  }
}
