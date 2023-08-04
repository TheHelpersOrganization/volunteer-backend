import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseModule } from '@app/firebase/firebase.module';
import { PrismaModule } from '@app/prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
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
    FirebaseModule,
  ],
  exports: [
    AppLoggerModule,
    ConfigModule,
    EventEmitterModule,
    PrismaModule,
    ScheduleModule,
    FirebaseModule,
  ],
})
export class CommonModule {}
