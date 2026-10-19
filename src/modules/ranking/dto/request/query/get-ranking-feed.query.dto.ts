import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { GetRankingFeedQuery } from '@volontariapp/contracts-nest';

export class GetRankingFeedQueryDTO implements GetRankingFeedQuery {
  @IsOptional()
  @IsString()
  cursor!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  limit!: number;
}
