import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PatientContextGuard } from '../common/guards/patient-context.guard';
import { RechercheMedecinDto } from './dto/recherche-medecin.dto';
import { RechercheService } from './recherche.service';

/** UC1 – précondition : le patient est authentifié. */
@Controller()
@UseGuards(PatientContextGuard)
export class RechercheController {
  constructor(private readonly recherche: RechercheService) {}

  /** GET /api/medecins?nom=&idSpecialite=&idCabinet= */
  @Get('medecins')
  rechercher(@Query() criteres: RechercheMedecinDto) {
    return this.recherche.rechercherMedecins(criteres);
  }

  /** GET /api/medecins/:id/disponibilites : créneaux futurs et libres */
  @Get('medecins/:id/disponibilites')
  disponibilites(@Param('id', ParseIntPipe) id: number) {
    return this.recherche.disponibilitesDuMedecin(id);
  }

  @Get('specialites')
  specialites() {
    return this.recherche.specialites();
  }

  @Get('cabinets')
  cabinets() {
    return this.recherche.cabinets();
  }
}
