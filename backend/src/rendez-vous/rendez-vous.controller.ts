import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { PatientId } from '../common/decorators/patient-id.decorator';
import { PatientContextGuard } from '../common/guards/patient-context.guard';
import { ReserverRendezVousDto } from './dto/reserver-rendez-vous.dto';
import { RendezVousResponseDto } from './dto/rendez-vous-response.dto';
import { RendezVousService } from './rendez-vous.service';

/** Couche présentation : valide le format et délègue au service. */
@Controller('rendez-vous')
@UseGuards(PatientContextGuard)
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  /** UC2 – POST /api/rendez-vous  { idDisponibilite, motif? } */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  reserver(
    @PatientId() idPatient: number,
    @Body() dto: ReserverRendezVousDto,
  ): Promise<RendezVousResponseDto> {
    return this.rendezVousService.reserver(idPatient, dto);
  }
}
