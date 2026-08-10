import { ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { RecruiterService } from './recruiter.service';

describe('RecruiterService', () => {
  const transaction = {
    recruiter: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn(),
    recruiter: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  let service: RecruiterService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RecruiterService(prisma);
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (client: typeof transaction) => unknown) =>
        callback(transaction),
    );
  });

  it('creates an organization and promotes its owner to recruiter', async () => {
    transaction.recruiter.findUnique.mockResolvedValue(null);
    transaction.organization.create.mockResolvedValue({ id: 'organization-1' });
    transaction.recruiter.create.mockResolvedValue({ id: 'recruiter-1' });
    transaction.user.update.mockResolvedValue({
      id: 'user-1',
      role: Role.RECRUITER,
    });

    await expect(
      service.onboard('user-1', {
        organizationName: 'HireFlow',
        designation: 'Hiring Manager',
      }),
    ).resolves.toEqual({
      organization: { id: 'organization-1' },
      recruiter: { id: 'recruiter-1' },
    });

    expect(transaction.recruiter.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        organizationId: 'organization-1',
        designation: 'Hiring Manager',
        phone: undefined,
        linkedinUrl: undefined,
      },
    });
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { role: Role.RECRUITER },
    });
  });

  it('rejects onboarding when the user already has a recruiter profile', async () => {
    transaction.recruiter.findUnique.mockResolvedValue({ id: 'recruiter-1' });

    await expect(
      service.onboard('user-1', { organizationName: 'HireFlow' }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(transaction.organization.create).not.toHaveBeenCalled();
  });
});
