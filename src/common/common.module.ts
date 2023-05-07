import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'src/prisma/prisma.module';
import { configModuleOptions } from './configs/module-options';
import { AppLoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    AppLoggerModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    PrismaModule,
  ],
  exports: [AppLoggerModule, ConfigModule, PrismaModule, ScheduleModule],
})
export class CommonModule {}
