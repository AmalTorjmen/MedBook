import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ConnexionDto {
  @IsEmail({}, { message: 'Courriel invalide.' })
  courriel: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  motDePasse: string;
}

export class InscriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est obligatoire.' })
  @MaxLength(150)
  nomComplet: string;

  @IsEmail({}, { message: 'Courriel invalide.' })
  courriel: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephone?: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  motDePasse: string;
}

export interface SessionDto {
  jeton: string;
  patient: { idPatient: number; nomComplet: string; courriel: string; photoUrl: string | null };
}
