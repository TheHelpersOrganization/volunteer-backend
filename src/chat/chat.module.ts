import { AuthModule } from '@app/auth/auth.module';
import { CommonModule } from '@app/common/common.module';
import { NotificationModule } from '@app/notification/notification.module';
import { ProfileModule } from '@app/profile/profile.module';
import { Module } from '@nestjs/common';
import { ChatController } from './controllers';
import { ChatGateway } from './gateways';
import { ChatService } from './services';

@Module({
  imports: [CommonModule, AuthModule, ProfileModule, NotificationModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
