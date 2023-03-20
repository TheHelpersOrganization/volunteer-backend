import { File } from '../../file/entities';

export class OrganizationFilesInputDto
  implements Readonly<OrganizationFilesInputDto>
{
  logo: File;

  banner: File;

  files: File[];
}
