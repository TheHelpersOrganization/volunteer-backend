import { Expose } from 'class-transformer';

export class LocationOutputDto {
  @Expose()
  id: number;

  @Expose()
  addressLine1?: string;

  @Expose()
  addressLine2?: string;

  @Expose()
  locality?: string;

  @Expose()
  region?: string;

  @Expose()
  country?: string;

  @Expose()
  latitude?: number;

  @Expose()
  longitude?: number;
}

export class ShortLocationOutputDto {
  @Expose()
  locality?: string | null;

  @Expose()
  region?: string | null;

  @Expose()
  country?: string | null;
}
