import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseModule } from '@app/firebase/firebase.module';
import { PrismaModule } from '@app/prisma/prisma.module';
import { REQUEST } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { Request } from 'express';
import { configModuleOptions } from './configs/module-options';
import { AppLoggerModule } from './logger/logger.module';
import { APP_REQUEST_CONTEXT, createRequestContext } from './request-context';

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
  providers: [
    {
      provide: APP_REQUEST_CONTEXT,
      scope: Scope.REQUEST,
      useFactory: (request: Request) => {
        console.log('request', request.user);
        return createRequestContext(request);
      },
      inject: [REQUEST],
    },
  ],
  exports: [
    AppLoggerModule,
    ConfigModule,
    EventEmitterModule,
    PrismaModule,
    ScheduleModule,
    FirebaseModule,
    APP_REQUEST_CONTEXT,
  ],
})
export class CommonModule {}
