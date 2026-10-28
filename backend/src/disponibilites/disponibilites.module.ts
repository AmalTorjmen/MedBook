import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disponibilite } from '../entities/disponibilite.entity';
import { DisponibiliteRepository } from './disponibilite.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Disponibilite])],
  providers: [DisponibiliteRepository],
  exports: [DisponibiliteRepository],
})
export class DisponibilitesModule {}
