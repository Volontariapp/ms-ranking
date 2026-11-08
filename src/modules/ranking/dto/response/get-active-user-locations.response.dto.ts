import type {
  GetActiveUserLocationsResponse,
  UserLocationCell,
} from '@volontariapp/contracts-nest';

export class UserLocationCellDTO implements UserLocationCell {
  lat!: number;
  lng!: number;
}

export class GetActiveUserLocationsResponseDTO implements GetActiveUserLocationsResponse {
  cells!: UserLocationCellDTO[];
}
