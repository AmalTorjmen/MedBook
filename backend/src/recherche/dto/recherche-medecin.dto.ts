import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** UC1 – critères de recherche (tous facultatifs). */
export class RechercheMedecinDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nom?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'idSpecialite doit être un entier.' })
  @Min(1)
  idSpecialite?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'idCabinet doit être un entier.' })
  @Min(1)
  idCabinet?: number;
}
