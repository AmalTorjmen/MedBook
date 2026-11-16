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

  /** URL d'une photo (facultative). Sinon, un avatar est généré côté frontend. */
  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  /** Hash scrypt « sel:hash » ; jamais renvoyé par l'API. */
  @Column({ name: 'mot_de_passe_hash', type: 'varchar', length: 255, nullable: true })
  motDePasseHash: string | null;

  @OneToMany(() => RendezVous, (rdv) => rdv.patient)
  rendezVous: RendezVous[];
}
