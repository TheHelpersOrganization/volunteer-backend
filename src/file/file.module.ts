import { CommonModule } from '@app/common/common.module';
import { Module } from '@nestjs/common';

import { FileController } from './controllers';
import { FileService } from './services';
import { IsFileIdValidator } from './validators';

@Module({
  imports: [CommonModule],
  controllers: [FileController],
  providers: [FileService, IsFileIdValidator],
  exports: [FileService],
})
export class FileModule {}
