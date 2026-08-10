import { ConflictException, NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { CandidateService } from './candidate.service';

describe('CandidateService', () => {
  const prisma = {
    candidate: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    job: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  let service: CandidateService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CandidateService(prisma);
  });

  it('creates a candidate profile and connects normalized skills', async () => {
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.candidate.create as jest.Mock).mockResolvedValue({
      id: 'candidate-1',
      userId: 'user-1',
    });

    await expect(
      service.onboard('user-1', {
        headline: 'Backend Engineer',
        skills: ['TypeScript', 'typescript', ' NestJS '],
      }),
    ).resolves.toEqual({ id: 'candidate-1', userId: 'user-1' });

    expect(prisma.candidate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          skills: {
            create: [
              {
                skill: {
                  connectOrCreate: {
                    where: { name: 'TypeScript' },
                    create: { name: 'TypeScript' },
                  },
                },
              },
              {
                skill: {
                  connectOrCreate: {
                    where: { name: 'NestJS' },
                    create: { name: 'NestJS' },
                  },
                },
              },
            ],
          },
        }),
      }),
    );
  });

  it('rejects onboarding when the profile already exists', async () => {
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue({
      id: 'candidate-1',
    });

    await expect(service.onboard('user-1', {})).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns only published jobs to candidates', async () => {
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

    await expect(service.listOpenJobs()).resolves.toEqual([]);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: JobStatus.OPEN },
      }),
    );
  });

  it('does not return unpublished jobs', async () => {
    (prisma.job.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.getOpenJob('draft-job')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
