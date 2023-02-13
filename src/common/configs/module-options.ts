import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';

import subconfigs from './subconfigs';
import { validate } from './validator';

export const configModuleOptions: ConfigModuleOptions = {
  cache: true,
  expandVariables: true,
  envFilePath: '.env',
  load: subconfigs,
  validate: validate,
};
