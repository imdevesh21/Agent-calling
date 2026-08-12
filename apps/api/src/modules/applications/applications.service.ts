import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { ApplicationStatus, JobStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { ApplyJobDto } from './dto/apply-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async applyToJob(userId: string, dto: ApplyJobDto) {
    // 1. Find candidate
    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    // 2. Find resume
    const resume = await this.prisma.resume.findUnique({
      where: { id: dto.resumeId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // 3. Ensure resume belongs to candidate
    if (resume.candidateId !== candidate.id) {
      throw new ForbiddenException('This resume does not belong to you');
    }

    // 4. Find job
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // 5. Ensure job is open
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Job is not open for applications');
    }

    // 6. Prevent duplicate application
    const existing = await this.prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobId: job.id,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already applied to this job');
    }

    // 7. Create application
    const application = await this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job.id,
        resumeId: resume.id,
        status: ApplicationStatus.APPLIED,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
          },
        },
      },
    });

    return {
      message: 'Application submitted successfully',
      application,
    };
  }

  async getMyApplications(userId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return this.prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getApplicationsForRecruiter(userId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return this.prisma.application.findMany({
      where: {
        job: {
          recruiterId: recruiter.id,
        },
      },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async updateStatus(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.recruiterId !== recruiter.id) {
      throw new ForbiddenException('You cannot update this application');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
      },
    });
  }
}
