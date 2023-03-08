import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

import { FileController } from './controllers';
import { File } from './entities';
import { FileRepository } from './repositories';
import { FileService } from './services';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService, FileRepository],
})
export class FileModule {}
