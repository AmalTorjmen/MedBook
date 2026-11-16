import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';
import { PatientRepository } from '../patients/patient.repository';
import { ConnexionDto, InscriptionDto, SessionDto } from './dto/connexion.dto';
import { hasherMotDePasse, verifierMotDePasse } from './password.util';
import { genererJeton } from './token.util';

@Injectable()
export class AuthService {
  constructor(private readonly patients: PatientRepository) {}

  async connecter(dto: ConnexionDto): Promise<SessionDto> {
    const patient = await this.patients.trouverParCourriel(dto.courriel.toLowerCase());
    if (!patient || !verifierMotDePasse(dto.motDePasse, patient.motDePasseHash)) {
      throw new UnauthorizedException('Courriel ou mot de passe incorrect.');
    }
    return this.session(patient);
  }

  async inscrire(dto: InscriptionDto): Promise<SessionDto> {
    const courriel = dto.courriel.toLowerCase();
    if (await this.patients.trouverParCourriel(courriel)) {
      throw new ConflictException('Un compte existe déjà avec ce courriel.');
    }
    const patient = await this.patients.creer({
      nomComplet: dto.nomComplet.trim(),
      courriel,
      telephone: dto.telephone ?? null,
      motDePasseHash: hasherMotDePasse(dto.motDePasse),
    });
    return this.session(patient);
  }

  async profil(idPatient: number): Promise<SessionDto['patient']> {
    const patient = await this.patients.trouverParId(idPatient);
    if (!patient) throw new UnauthorizedException('Session invalide.');
    return { idPatient: patient.idPatient, nomComplet: patient.nomComplet, courriel: patient.courriel, photoUrl: patient.photoUrl };
  }

  private session(p: Patient): SessionDto {
    return {
      jeton: genererJeton(p.idPatient, p.courriel),
      patient: { idPatient: p.idPatient, nomComplet: p.nomComplet, courriel: p.courriel, photoUrl: p.photoUrl },
    };
  }
}
