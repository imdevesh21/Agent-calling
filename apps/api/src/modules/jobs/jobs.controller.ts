import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('recruiters/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECRUITER)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(user.id, createJobDto);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.list(user.id);
  }

  @Get(':id')
  getById(@CurrentUser() user: AuthenticatedUser, @Param('id') jobId: string) {
    return this.jobsService.getById(user.id, jobId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') jobId: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(user.id, jobId, updateJobDto);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: AuthenticatedUser, @Param('id') jobId: string) {
    return this.jobsService.publish(user.id, jobId);
  }

  @Post(':id/close')
  close(@CurrentUser() user: AuthenticatedUser, @Param('id') jobId: string) {
    return this.jobsService.close(user.id, jobId);
  }
}
