import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { ContactController } from './controllers';
import { ContactService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
