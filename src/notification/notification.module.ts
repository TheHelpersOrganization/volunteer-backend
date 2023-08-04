import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';
import { NotificationController } from './controllers';
import { NotificationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
