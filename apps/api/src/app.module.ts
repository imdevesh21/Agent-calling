import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './config';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
