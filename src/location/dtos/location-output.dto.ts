import { Expose } from 'class-transformer';

export class LocationOutputDto {
  @Expose()
  addressLine1: string;

  @Expose()
  addressLine2: string;

  @Expose()
  locality: string;

  @Expose()
  region: string;

  @Expose()
  country: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;
}
