import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { NotificationController } from './controllers';
import { NotificationService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
