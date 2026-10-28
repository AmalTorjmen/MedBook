import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ReserverRendezVousDto {
  @IsInt({ message: 'idDisponibilite doit être un entier.' })
  @Min(1, { message: 'idDisponibilite doit être positif.' })
  idDisponibilite: number;

  @IsOptional()
  @IsString({ message: 'Le motif doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le motif ne doit pas dépasser 255 caractères.' })
  motif?: string;
}
