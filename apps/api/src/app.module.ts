import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './config';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
