import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Disponibilite } from './disponibilite.entity';
import { Patient } from './patient.entity';
import { StatutRendezVous } from './statut-rendez-vous.enum';

@Entity('rendez_vous')
export class RendezVous {
  @PrimaryGeneratedColumn({ name: 'id_rendez_vous' })
  idRendezVous: number;

  @CreateDateColumn({ name: 'date_creation', type: 'datetime' })
  dateCreation: Date;

  @Column({
    type: 'enum',
    enum: StatutRendezVous,
    default: StatutRendezVous.CONFIRME,
  })
  statut: StatutRendezVous;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motif: string | null;

  @Column({ name: 'id_patient', type: 'int' })
  idPatient: number;

  @Column({ name: 'id_disponibilite', type: 'int' })
  idDisponibilite: number;

  /**
   * Colonne générée par MySQL (voir database/schema.sql) :
   * = id_disponibilite si statut = 'CONFIRME', sinon NULL.
   * Son index UNIQUE garantit « un seul rendez-vous confirmé par créneau »
   * tout en conservant l'historique des rendez-vous annulés.
   * Lecture seule : jamais écrite par l'application.
   */
  @Column({
    name: 'creneau_confirme_id',
    type: 'int',
    nullable: true,
    insert: false,
    update: false,
  })
  creneauConfirmeId: number | null;

  @ManyToOne(() => Patient, (patient) => patient.rendezVous, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_patient' })
  patient: Patient;

  @ManyToOne(() => Disponibilite, (dispo) => dispo.rendezVous, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_disponibilite' })
  disponibilite: Disponibilite;
}
