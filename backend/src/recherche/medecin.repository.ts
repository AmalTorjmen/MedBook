import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cabinet } from '../entities/cabinet.entity';
import { Medecin } from '../entities/medecin.entity';
import { Specialite } from '../entities/specialite.entity';
import { RechercheMedecinDto } from './dto/recherche-medecin.dto';

/** Couche accès aux données de l'UC1. */
@Injectable()
export class MedecinRepository {
  constructor(
    @InjectRepository(Medecin) private readonly medecins: Repository<Medecin>,
    @InjectRepository(Specialite) private readonly specialites: Repository<Specialite>,
    @InjectRepository(Cabinet) private readonly cabinets: Repository<Cabinet>,
  ) {}

  rechercher(criteres: RechercheMedecinDto): Promise<Medecin[]> {
    const qb = this.medecins
      .createQueryBuilder('m')
      .innerJoinAndSelect('m.specialite', 's')
      .orderBy('m.nomComplet', 'ASC');

    if (criteres.nom?.trim()) {
      qb.andWhere('m.nomComplet LIKE :nom', { nom: `%${criteres.nom.trim()}%` });
    }
    if (criteres.idSpecialite) {
      qb.andWhere('m.idSpecialite = :idSpecialite', { idSpecialite: criteres.idSpecialite });
    }
    if (criteres.idCabinet) {
      // Le cabinet est porté par la disponibilité : un médecin « exerce » dans
      // un cabinet s'il y propose au moins un créneau.
      qb.andWhere(
        'EXISTS (SELECT 1 FROM disponibilite d WHERE d.id_medecin = m.id_medecin AND d.id_cabinet = :idCabinet)',
        { idCabinet: criteres.idCabinet },
      );
    }
    return qb.getMany();
  }

  trouverParId(idMedecin: number): Promise<Medecin | null> {
    return this.medecins.findOne({ where: { idMedecin }, relations: { specialite: true } });
  }

  toutesSpecialites(): Promise<Specialite[]> {
    return this.specialites.find({ order: { nom: 'ASC' } });
  }

  tousCabinets(): Promise<Cabinet[]> {
    return this.cabinets.find({ order: { nom: 'ASC' } });
  }
}
