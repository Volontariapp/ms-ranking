import type { UpdateUserLocationResponse } from '@volontariapp/contracts-nest';

export class UpdateUserLocationResponseDTO implements UpdateUserLocationResponse {
  accepted!: boolean;
}
