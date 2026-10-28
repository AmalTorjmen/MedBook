import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Disponibilite } from './disponibilite.entity';
import { Specialite } from './specialite.entity';

@Entity('medecin')
export class Medecin {
  @PrimaryGeneratedColumn({ name: 'id_medecin' })
  idMedecin: number;

  @Column({ name: 'nom_complet', type: 'varchar', length: 150 })
  nomComplet: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  courriel: string;

  @Column({ name: 'id_specialite', type: 'int' })
  idSpecialite: number;

  // Hypothèse de conception : un médecin a une seule spécialité.
  @ManyToOne(() => Specialite, (specialite) => specialite.medecins, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_specialite' })
  specialite: Specialite;

  @OneToMany(() => Disponibilite, (dispo) => dispo.medecin)
  disponibilites: Disponibilite[];
}
