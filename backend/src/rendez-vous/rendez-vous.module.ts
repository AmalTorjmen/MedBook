import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisponibilitesModule } from '../disponibilites/disponibilites.module';
import { RendezVous } from '../entities/rendez-vous.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PatientsModule } from '../patients/patients.module';
import { RendezVousController } from './rendez-vous.controller';
import { RendezVousRepository } from './rendez-vous.repository';
import { RendezVousService } from './rendez-vous.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RendezVous]),
    DisponibilitesModule,
    PatientsModule,
    NotificationsModule,
  ],
  controllers: [RendezVousController],
  providers: [RendezVousService, RendezVousRepository],
  exports: [RendezVousService, RendezVousRepository], // réutilisés par l'UC3 (annulation)
})
export class RendezVousModule {}
