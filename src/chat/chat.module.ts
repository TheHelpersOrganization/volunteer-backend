import { AuthModule } from '@app/auth/auth.module';
import { CommonModule } from '@app/common/common.module';
import { NotificationModule } from '@app/notification/notification.module';
import { ProfileModule } from '@app/profile/profile.module';
import { Module } from '@nestjs/common';
import { ChatAuthService } from './auth';
import { ChatController, ChatGroupController } from './controllers';
import { ChatGateway } from './gateways';
import { ChatGroupService, ChatService } from './services';

@Module({
  imports: [CommonModule, AuthModule, ProfileModule, NotificationModule],
  controllers: [ChatGroupController, ChatController],
  providers: [ChatGateway, ChatGroupService, ChatService, ChatAuthService],
})
export class ChatModule {}
