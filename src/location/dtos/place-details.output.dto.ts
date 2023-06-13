import { Expose, Type } from 'class-transformer';

export class PlaceDetailsOutputDto {
  @Expose()
  @Type(() => AddressComponentOutputDto)
  addressComponents?: AddressComponentOutputDto[];

  @Expose()
  formattedAddress?: string;

  @Expose()
  latitude?: number;

  @Expose()
  longitude?: number;
}

export class AddressComponentOutputDto {
  @Expose()
  longName: string;

  @Expose()
  shortName: string;

  @Expose()
  types: string[];
}
