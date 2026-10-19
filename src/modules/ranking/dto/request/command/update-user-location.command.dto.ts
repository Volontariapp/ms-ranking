import { IsNumber, Max, Min } from 'class-validator';
import type { UpdateUserLocationCommand } from '@volontariapp/contracts-nest';

export class UpdateUserLocationCommandDTO implements UpdateUserLocationCommand {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}
