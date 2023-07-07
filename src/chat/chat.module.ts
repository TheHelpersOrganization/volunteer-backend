import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ProfileModule } from 'src/profile/profile.module';
import { ChatController } from './controllers';
import { ChatGateway } from './gateways';
import { ChatService } from './services';

@Module({
  imports: [CommonModule, ProfileModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
