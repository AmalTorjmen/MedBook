import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { PatientId } from '../common/decorators/patient-id.decorator';
import { PatientContextGuard } from '../common/guards/patient-context.guard';
import { AuthService } from './auth.service';
import { ConnexionDto, InscriptionDto } from './dto/connexion.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** POST /api/auth/connexion { courriel, motDePasse } */
  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  connecter(@Body() dto: ConnexionDto) {
    return this.auth.connecter(dto);
  }

  /** POST /api/auth/inscription { nomComplet, courriel, telephone?, motDePasse } */
  @Post('inscription')
  inscrire(@Body() dto: InscriptionDto) {
    return this.auth.inscrire(dto);
  }

  /** GET /api/auth/moi : profil du patient connecté */
  @Get('moi')
  @UseGuards(PatientContextGuard)
  moi(@PatientId() idPatient: number) {
    return this.auth.profil(idPatient);
  }
}
