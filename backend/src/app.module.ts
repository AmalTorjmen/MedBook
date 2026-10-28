import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { DisponibilitesModule } from './disponibilites/disponibilites.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: databaseConfig }),
    PatientsModule,
    DisponibilitesModule,
    // Chaque UC ajoute ici son module (UC1, UC2, ...)
  ],
})
export class AppModule {}