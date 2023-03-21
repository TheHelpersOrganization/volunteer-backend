import { Client } from '@googlemaps/google-maps-services-js';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import googleMapsConfig from 'src/common/configs/subconfigs/google-maps.config';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

import { RequestContext } from '../../common/request-context';
import { PrismaService } from '../../prisma';
import { UpdateLocationInputDto } from '../dtos';
import { CreateLocationInputDto } from '../dtos/create-location-input.dto';
import { LocationOutputDto } from '../dtos/location-output.dto';
import { InvalidCoordinateException } from '../exceptions';

@Injectable()
export class LocationService extends AbstractService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(
    logger: AppLogger,
    @Inject(googleMapsConfig.KEY)
    private readonly googleMapsConfigApi: ConfigType<typeof googleMapsConfig>,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
    this.client = new Client();
    this.apiKey = googleMapsConfigApi.apiKey;
  }

  async create(
    context: RequestContext,
    dto: CreateLocationInputDto,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.create);
    if (
      (dto.longitude == null && dto.latitude != null) ||
      (dto.longitude != null && dto.latitude == null)
    ) {
      throw new InvalidCoordinateException();
    }
    const location = await this.prisma.location.create({ data: dto });
    return this.output(LocationOutputDto, location);
  }

  async createMany(
    dtos: CreateLocationInputDto[],
  ): Promise<LocationOutputDto[]> {
    for (const dto of dtos) {
      if (
        (dto.longitude == null && dto.latitude != null) ||
        (dto.longitude != null && dto.latitude == null)
      ) {
        throw new InvalidCoordinateException();
      }
    }
    const locations = await this.prisma.$transaction(
      dtos.map((dto) => this.prisma.location.create({ data: dto })),
    );
    return this.outputArray(LocationOutputDto, locations);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.getById);
    return this.output(
      LocationOutputDto,
      await this.prisma.location.findUnique({ where: { id: id } }),
    );
  }

  async getByIds(ids: number[]): Promise<LocationOutputDto[]> {
    return this.outputArray(
      LocationOutputDto,
      await this.prisma.location.findMany({ where: { id: { in: ids } } }),
    );
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateLocationInputDto,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.update);
    const location = await this.prisma.location.update({
      where: {
        id: id,
      },
      data: dto,
    });
    return this.output(LocationOutputDto, location);
  }

  async delete(
    context: RequestContext,
    id: number,
  ): Promise<LocationOutputDto> {
    this.logCaller(context, this.delete);
    const location = this.prisma.location.delete({
      where: {
        id: id,
      },
    });
    return this.output(LocationOutputDto, location);
  }
}
