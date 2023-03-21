import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { FileService } from '../../file/services';
import { CreateOrganizationInputDto, OrganizationFilesInputDto } from '../dtos';

@Injectable()
export class OrganizationFilesPipe
  implements PipeTransform<CreateOrganizationInputDto>
{
  constructor(private readonly fileService: FileService) {}

  async transform(
    value: CreateOrganizationInputDto,
    metadata: ArgumentMetadata,
  ): Promise<OrganizationFilesInputDto> {
    const logo = await this.fileService.getById(value.logo);
    const banner = await this.fileService.getById(value.banner);
    const files = await this.fileService.getByIds(value.files);

    return {
      logo,
      banner,
      files,
    };
  }
}
