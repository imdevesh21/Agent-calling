import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { OnboardRecruiterDto } from './dto/onboard-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';

@Injectable()
export class RecruiterService {
  constructor(private readonly prisma: PrismaService) {}

  async onboard(userId: string, dto: OnboardRecruiterDto) {
    return this.prisma.$transaction(async (transaction) => {
      const existingRecruiter = await transaction.recruiter.findUnique({
        where: { userId },
      });

      if (existingRecruiter) {
        throw new ConflictException('Recruiter profile already exists');
      }

      const organization = await transaction.organization.create({
        data: {
          name: dto.organizationName,
          description: dto.organizationDescription,
          website: dto.organizationWebsite,
          industry: dto.organizationIndustry,
          location: dto.organizationLocation,
          size: dto.organizationSize,
        },
      });

      const recruiter = await transaction.recruiter.create({
        data: {
          userId,
          organizationId: organization.id,
          designation: dto.designation,
          phone: dto.phone,
          linkedinUrl: dto.linkedinUrl,
        },
      });

      await transaction.user.update({
        where: { id: userId },
        data: { role: Role.RECRUITER },
      });

      return { organization, recruiter };
    });
  }

  async getProfile(userId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
      include: { organization: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return recruiter;
  }

  async updateProfile(userId: string, dto: UpdateRecruiterDto) {
    const recruiter = await this.getProfile(userId);

    return this.prisma.recruiter.update({
      where: { id: recruiter.id },
      data: dto,
      include: { organization: true },
    });
  }
}
