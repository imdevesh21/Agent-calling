import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmploymentType, Job, JobStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { RecruiterService } from '../recruiter/recruiter.service';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  const job: Job = {
    id: 'job-1',
    title: 'Backend Engineer',
    description: 'Build APIs',
    location: 'Bengaluru',
    salaryMin: 1_200_000,
    salaryMax: 1_800_000,
    experience: 3,
    employmentType: EmploymentType.FULL_TIME,
    status: JobStatus.DRAFT,
    recruiterId: 'recruiter-1',
    organizationId: 'organization-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const prisma = {
    job: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const recruiterService = {
    getProfile: jest.fn(),
  } as unknown as RecruiterService;

  let service: JobsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobsService(prisma, recruiterService);
    (recruiterService.getProfile as jest.Mock).mockResolvedValue({
      id: 'recruiter-1',
      organizationId: 'organization-1',
    });
  });

  it('creates a draft job for the current recruiter organization', async () => {
    (prisma.job.create as jest.Mock).mockResolvedValue(job);

    await expect(
      service.create('user-1', {
        title: job.title,
        description: job.description,
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        experience: job.experience ?? undefined,
        employmentType: EmploymentType.FULL_TIME,
      }),
    ).resolves.toEqual(job);

    expect(prisma.job.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recruiterId: 'recruiter-1',
        organizationId: 'organization-1',
        status: JobStatus.DRAFT,
      }),
    });
  });

  it('rejects an invalid salary range before creating a job', async () => {
    await expect(
      service.create('user-1', {
        title: job.title,
        description: job.description,
        salaryMin: 2_000_000,
        salaryMax: 1_000_000,
        employmentType: EmploymentType.FULL_TIME,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.job.create).not.toHaveBeenCalled();
  });

  it("does not expose another recruiter's job", async () => {
    (prisma.job.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.getById('user-1', 'other-job')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('publishes only draft jobs owned by the recruiter', async () => {
    (prisma.job.findFirst as jest.Mock).mockResolvedValue(job);
    (prisma.job.update as jest.Mock).mockResolvedValue({
      ...job,
      status: JobStatus.OPEN,
    });

    await expect(service.publish('user-1', job.id)).resolves.toMatchObject({
      status: JobStatus.OPEN,
    });

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: { status: JobStatus.OPEN },
    });
  });
});
