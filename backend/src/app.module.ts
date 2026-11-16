import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { DisponibilitesModule } from './disponibilites/disponibilites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PatientsModule } from './patients/patients.module';
import { RechercheModule } from './recherche/recherche.module';
import { RendezVousModule } from './rendez-vous/rendez-vous.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: databaseConfig }),
    PatientsModule,
    DisponibilitesModule,
    NotificationsModule,
    RendezVousModule,
    AuthModule,
    RechercheModule,
  ],
})
export class AppModule {}