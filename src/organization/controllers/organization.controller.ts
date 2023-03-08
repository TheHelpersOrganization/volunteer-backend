import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateOrganizationInputDto } from '../dto/create-organization-input.dto';
import { OrganizationService } from '../organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationInputDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }
}
