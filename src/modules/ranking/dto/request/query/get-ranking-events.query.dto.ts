import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { GetRankingEventsQuery } from '@volontariapp/contracts-nest';

export class GetRankingEventsQueryDTO implements GetRankingEventsQuery {
  @IsOptional()
  @IsString()
  cursor!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  limit!: number;
}
