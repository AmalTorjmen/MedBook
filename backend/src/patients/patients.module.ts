import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientRepository } from './patient.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  providers: [PatientRepository],
  exports: [PatientRepository],
})
export class PatientsModule {}
