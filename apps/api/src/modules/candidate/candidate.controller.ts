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
import { OnboardCandidateDto } from './dto/onboard-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateService } from './candidate.service';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CANDIDATE)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post('onboard')
  onboard(
    @CurrentUser() user: AuthenticatedUser,
    @Body() onboardCandidateDto: OnboardCandidateDto,
  ) {
    return this.candidateService.onboard(user.id, onboardCandidateDto);
  }

  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.candidateService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.updateProfile(user.id, updateCandidateDto);
  }

  @Get('jobs')
  listOpenJobs() {
    return this.candidateService.listOpenJobs();
  }

  @Get('jobs/:id')
  getOpenJob(@Param('id') jobId: string) {
    return this.candidateService.getOpenJob(jobId);
  }
}
