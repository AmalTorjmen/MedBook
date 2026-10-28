import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Disponibilite } from './disponibilite.entity';

@Entity('cabinet')
export class Cabinet {
  @PrimaryGeneratedColumn({ name: 'id_cabinet' })
  idCabinet: number;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 150 })
  emplacement: string;

  @OneToMany(() => Disponibilite, (dispo) => dispo.cabinet)
  disponibilites: Disponibilite[];
}
