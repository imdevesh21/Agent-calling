import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { OnboardRecruiterDto } from './dto/onboard-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { RecruiterService } from './recruiter.service';

@Controller('recruiters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  @Post('onboard')
  @Roles(Role.CANDIDATE, Role.RECRUITER)
  onboard(
    @CurrentUser() user: AuthenticatedUser,
    @Body() onboardRecruiterDto: OnboardRecruiterDto,
  ) {
    return this.recruiterService.onboard(user.id, onboardRecruiterDto);
  }

  @Get('me')
  @Roles(Role.RECRUITER)
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.recruiterService.getProfile(user.id);
  }

  @Patch('me')
  @Roles(Role.RECRUITER)
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateRecruiterDto: UpdateRecruiterDto,
  ) {
    return this.recruiterService.updateProfile(user.id, updateRecruiterDto);
  }
}
