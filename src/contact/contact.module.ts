import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { ContactController } from './controllers';
import { ContactService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
