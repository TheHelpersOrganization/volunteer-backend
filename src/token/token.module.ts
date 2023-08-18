import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { TokenService } from './services/token.service';

@Module({
  imports: [CommonModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
