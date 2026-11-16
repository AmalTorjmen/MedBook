import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisponibilitesModule } from '../disponibilites/disponibilites.module';
import { Cabinet } from '../entities/cabinet.entity';
import { Medecin } from '../entities/medecin.entity';
import { Specialite } from '../entities/specialite.entity';
import { MedecinRepository } from './medecin.repository';
import { RechercheController } from './recherche.controller';
import { RechercheService } from './recherche.service';

@Module({
  imports: [TypeOrmModule.forFeature([Medecin, Specialite, Cabinet]), DisponibilitesModule],
  controllers: [RechercheController],
  providers: [MedecinRepository, RechercheService],
})
export class RechercheModule {}
