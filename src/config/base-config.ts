import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { BackendConfig, PostgresConfig } from '@volontariapp/config';

export class CustomConfig extends BackendConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;
}
