import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cabinet } from './cabinet.entity';
import { Medecin } from './medecin.entity';
import { RendezVous } from './rendez-vous.entity';

/** Un créneau horaire précis proposé par un médecin dans un cabinet. */
@Entity('disponibilite')
export class Disponibilite {
  @PrimaryGeneratedColumn({ name: 'id_disponibilite' })
  idDisponibilite: number;

  /** Format YYYY-MM-DD */
  @Column({ type: 'date' })
  date: string;

  /** Format HH:mm:ss */
  @Column({ name: 'heure_debut', type: 'time' })
  heureDebut: string;

  /** Format HH:mm:ss */
  @Column({ name: 'heure_fin', type: 'time' })
  heureFin: string;

  @Column({ name: 'id_medecin', type: 'int' })
  idMedecin: number;

  @Column({ name: 'id_cabinet', type: 'int' })
  idCabinet: number;

  @ManyToOne(() => Medecin, (medecin) => medecin.disponibilites, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_medecin' })
  medecin: Medecin;

  @ManyToOne(() => Cabinet, (cabinet) => cabinet.disponibilites, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_cabinet' })
  cabinet: Cabinet;

  @OneToMany(() => RendezVous, (rdv) => rdv.disponibilite)
  rendezVous: RendezVous[];
}
