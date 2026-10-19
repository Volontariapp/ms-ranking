import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class RankingConfig {
  /** Age au-dela duquel la liste d'evenements est servie perimee et rafraichie (RANKING_STALE_AFTER_HOURS). */
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  staleAfterHours!: number;

  /** Age au-dela duquel le feed de posts est servi perime et rafraichi (RANKING_FEED_STALE_AFTER_HOURS). */
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  feedStaleAfterHours!: number;

  /** Duree apres laquelle une demande sans resultat est reemise a la lecture suivante. */
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestTtlSeconds!: number;

  /** Delai de planification des demandes de fond, laisse arriver les demandes suivantes (coalescence). */
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  debounceSeconds!: number;

  /** Deplacement (km) au-dela duquel une nouvelle position declenche un recalcul. */
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  locationRefreshKm!: number;

  /** Duree pendant laquelle un evenement passe (PASS) est exclu des pages servies. */
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  passCooldownDays!: number;

  /** Cle de 32 octets aleatoires qui chiffre la position (secret scelle RANKING_LOCATION_KEY). */
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  locationKey!: string;
}
