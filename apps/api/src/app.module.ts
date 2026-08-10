import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './config';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { RecruiterModule } from './modules/recruiter/recruiter.module';

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
    CandidateModule,
    RecruiterModule,
    JobsModule,
  ],
})
export class AppModule {}
