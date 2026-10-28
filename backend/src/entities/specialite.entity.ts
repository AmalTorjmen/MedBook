import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Medecin } from './medecin.entity';

@Entity('specialite')
export class Specialite {
  @PrimaryGeneratedColumn({ name: 'id_specialite' })
  idSpecialite: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nom: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @OneToMany(() => Medecin, (medecin) => medecin.specialite)
  medecins: Medecin[];
}
