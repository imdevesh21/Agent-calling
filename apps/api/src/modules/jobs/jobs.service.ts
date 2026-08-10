import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Job, JobStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { RecruiterService } from '../recruiter/recruiter.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recruiterService: RecruiterService,
  ) {}

  async create(userId: string, dto: CreateJobDto) {
    this.validateSalaryRange(dto.salaryMin, dto.salaryMax);

    const recruiter = await this.recruiterService.getProfile(userId);

    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        experience: dto.experience,
        employmentType: dto.employmentType,
        status: JobStatus.DRAFT,
        recruiterId: recruiter.id,
        organizationId: recruiter.organizationId,
      },
    });
  }

  async list(userId: string) {
    const recruiter = await this.recruiterService.getProfile(userId);

    return this.prisma.job.findMany({
      where: { recruiterId: recruiter.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, jobId: string) {
    return this.getOwnedJob(userId, jobId);
  }

  async update(userId: string, jobId: string, dto: UpdateJobDto) {
    const job = await this.getOwnedJob(userId, jobId);

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('Closed jobs cannot be updated');
    }

    this.validateSalaryRange(
      dto.salaryMin ?? job.salaryMin ?? undefined,
      dto.salaryMax ?? job.salaryMax ?? undefined,
    );

    return this.prisma.job.update({
      where: { id: job.id },
      data: dto,
    });
  }

  async publish(userId: string, jobId: string) {
    const job = await this.getOwnedJob(userId, jobId);

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException('Only draft jobs can be published');
    }

    return this.prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.OPEN },
    });
  }

  async close(userId: string, jobId: string) {
    const job = await this.getOwnedJob(userId, jobId);

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('Job is already closed');
    }

    return this.prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.CLOSED },
    });
  }

  private async getOwnedJob(userId: string, jobId: string): Promise<Job> {
    const recruiter = await this.recruiterService.getProfile(userId);
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        recruiterId: recruiter.id,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private validateSalaryRange(salaryMin?: number, salaryMax?: number) {
    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      salaryMin > salaryMax
    ) {
      throw new BadRequestException(
        'Minimum salary cannot be greater than maximum salary',
      );
    }
  }
}
