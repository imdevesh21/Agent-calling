import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RecruiterModule } from '../recruiter/recruiter.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [AuthModule, RecruiterModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
