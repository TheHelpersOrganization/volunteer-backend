import { Expose } from 'class-transformer';

import { ContactOutputDto } from '../../contact/dtos';
import { LocationOutputDto } from '../../location/dtos/location-output.dto';

export class OrganizationOutputDto {
  @Expose()
  name: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  email: string;

  @Expose()
  description: string;

  @Expose()
  website: string;

  @Expose()
  logo: number;

  @Expose()
  banner: number;

  @Expose()
  locations: LocationOutputDto[] | number[];

  @Expose()
  contacts: ContactOutputDto[] | number[];
}
