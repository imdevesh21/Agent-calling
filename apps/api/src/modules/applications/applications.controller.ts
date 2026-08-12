import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Role } from '@prisma/client';

import { ApplicationsService } from './applications.service';
import { ApplyJobDto } from './dto/apply-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(Role.CANDIDATE)
  apply(@CurrentUser() user: any, @Body() dto: ApplyJobDto) {
    return this.applicationsService.applyToJob(user.userId, dto);
  }

  @Get('me')
  @Roles(Role.CANDIDATE)
  getMyApplications(@CurrentUser() user: any) {
    return this.applicationsService.getMyApplications(user.userId);
  }

  @Get('recruiter')
  @Roles(Role.RECRUITER)
  getRecruiterApplications(@CurrentUser() user: any) {
    return this.applicationsService.getApplicationsForRecruiter(user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.RECRUITER)
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user.userId, id, dto);
  }
}
