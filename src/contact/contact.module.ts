import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ContactService } from './services';

@Module({
  imports: [CommonModule],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
