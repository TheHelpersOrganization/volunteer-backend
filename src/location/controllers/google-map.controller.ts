import { Body, Controller, Get, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { AddressQueryDto } from '../dtos';
import { LocationService } from '../services';

// Proxies Google Maps API
// If Google Maps API is called directly from web client, it will be blocked by CORS policy
@Controller('locations/google-map')
export class GoogleMapController {
  constructor(private readonly locationService: LocationService) {}

  @Get('geocode')
  async geocode(
    @ReqContext() context: RequestContext,
    @Body() dto: AddressQueryDto,
  ) {
    return this.locationService.geocode(context, dto);
  }

  @Get('place-autocomplete')
  async placeAutocomplete(
    @ReqContext() context: RequestContext,
    @Query() query: AddressQueryDto,
  ) {
    return this.locationService.placeAutocomplete(context, query);
  }
}
