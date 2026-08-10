import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { OnboardCandidateDto } from './dto/onboard-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(private readonly prisma: PrismaService) {}

  async onboard(userId: string, dto: OnboardCandidateDto) {
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { userId },
    });

    if (existingCandidate) {
      throw new ConflictException('Candidate profile already exists');
    }

    const { skills, ...profile } = dto;

    return this.prisma.candidate.create({
      data: {
        userId,
        ...profile,
        skills: this.buildSkillsInput(skills),
      },
      include: this.profileInclude(),
    });
  }

  async getProfile(userId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
      include: this.profileInclude(),
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return candidate;
  }

  async updateProfile(userId: string, dto: UpdateCandidateDto) {
    const candidate = await this.getProfile(userId);
    const { skills, ...profile } = dto;

    return this.prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        ...profile,
        ...(skills === undefined
          ? {}
          : {
              skills: {
                deleteMany: {},
                create: this.buildSkillsInput(skills)?.create,
              },
            }),
      },
      include: this.profileInclude(),
    });
  }

  async listOpenJobs() {
    return this.prisma.job.findMany({
      where: { status: JobStatus.OPEN },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            industry: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOpenJob(jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        status: JobStatus.OPEN,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            industry: true,
            location: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Published job not found');
    }

    return job;
  }

  private buildSkillsInput(skills?: string[]) {
    if (skills === undefined) {
      return undefined;
    }

    const normalizedSkills = new Map<string, string>();

    for (const skill of skills) {
      const trimmedSkill = skill.trim();

      if (!trimmedSkill) {
        throw new BadRequestException('Skills cannot be blank');
      }

      const normalizedName = trimmedSkill.toLowerCase();
      if (!normalizedSkills.has(normalizedName)) {
        normalizedSkills.set(normalizedName, trimmedSkill);
      }
    }

    return {
      create: Array.from(normalizedSkills.values()).map((name) => ({
        skill: {
          connectOrCreate: {
            where: { name },
            create: { name },
          },
        },
      })),
    };
  }

  private profileInclude() {
    return {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      skills: {
        include: { skill: true },
        orderBy: { skill: { name: 'asc' as const } },
      },
    };
  }
}
