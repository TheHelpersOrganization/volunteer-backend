import { Client } from '@googlemaps/google-maps-services-js';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import googleMapsConfig from 'src/common/configs/subconfigs/google-maps.config';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

import { LocationInputDto } from '../dtos/location-input.dto';
import { LocationOutputDto } from '../dtos/location-output.dto';
import { InvalidCoordinateException } from '../exceptions';
import { LocationRepository } from '../repositories';

@Injectable()
export class LocationService extends AbstractService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(
    logger: AppLogger,
    @Inject(googleMapsConfig.KEY)
    private readonly googleMapsConfigApi: ConfigType<typeof googleMapsConfig>,
    private readonly locationRepository: LocationRepository,
  ) {
    super(logger);
    this.client = new Client();
    this.apiKey = googleMapsConfigApi.apiKey;
  }

  async createLocation(dto: LocationInputDto): Promise<LocationOutputDto> {
    if (
      (dto.longitude == null && dto.latitude != null) ||
      (dto.longitude != null && dto.latitude == null)
    ) {
      throw new InvalidCoordinateException();
    }
    const location = await this.locationRepository.save(dto);
    return this.output(LocationOutputDto, location);
  }
}
