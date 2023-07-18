import { Expose, Type } from 'class-transformer';

import { ContactOutputDto } from '../../contact/dtos';
import { LocationOutputDto } from '../../location/dtos/location-output.dto';
import { OrganizationStatus } from '../constants';
import { MemberOutputDto } from './member.output.dto';

export class OrganizationOutputDto {
  @Expose()
  id: number;

  @Expose()
  status: OrganizationStatus;

  @Expose()
  isDisabled: boolean;

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
  @Type(() => LocationOutputDto)
  locations: LocationOutputDto[];

  @Expose()
  @Type(() => ContactOutputDto)
  contacts: ContactOutputDto[];

  @Expose()
  numberOfMembers: number;

  @Expose()
  @Type(() => MemberOutputDto)
  myMembers: MemberOutputDto[];

  @Expose()
  hasJoined: boolean;
}
