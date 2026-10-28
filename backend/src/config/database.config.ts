import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Cabinet } from '../entities/cabinet.entity';
import { Disponibilite } from '../entities/disponibilite.entity';
import { Medecin } from '../entities/medecin.entity';
import { Patient } from '../entities/patient.entity';
import { RendezVous } from '../entities/rendez-vous.entity';
import { Specialite } from '../entities/specialite.entity';

export function databaseConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.get<string>('DB_HOST', '127.0.0.1'),
    port: Number(config.get<string>('DB_PORT', '3306')),
    username: config.get<string>('DB_USER', 'root'),
    password: config.get<string>('DB_PASSWORD', ''),
    database: config.get<string>('DB_NAME', 'medbook'),
    entities: [Specialite, Medecin, Cabinet, Patient, Disponibilite, RendezVous],
    synchronize: false,
    timezone: 'local',
  };
}