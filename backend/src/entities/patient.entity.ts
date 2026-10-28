import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RendezVous } from './rendez-vous.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn({ name: 'id_patient' })
  idPatient: number;

  @Column({ name: 'nom_complet', type: 'varchar', length: 150 })
  nomComplet: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  courriel: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone: string | null;

  @OneToMany(() => RendezVous, (rdv) => rdv.patient)
  rendezVous: RendezVous[];
}
