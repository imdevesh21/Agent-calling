import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { AuthService } from './auth.services';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const user: User = {
    id: 'user-1',
    email: 'candidate@example.com',
    passwordHash: 'hashed-password',
    role: Role.CANDIDATE,
    firstName: 'Ada',
    lastName: 'Lovelace',
    avatarUrl: null,
    isVerified: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;
  const configService = {
    getOrThrow: jest.fn(
      (key: string) =>
        ({
          'jwt.accessSecret': 'access-secret',
          'jwt.refreshSecret': 'refresh-secret',
          'jwt.accessExpires': '15m',
          'jwt.refreshExpires': '7d',
        })[key],
    ),
  } as unknown as ConfigService;
  const bcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  const bcryptCompare = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma, jwtService, configService);
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
  });

  it('creates a candidate user with a hashed password and returns tokens', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    bcryptHash.mockResolvedValue('hashed-password' as never);
    (prisma.user.create as jest.Mock).mockResolvedValue(user);

    await expect(
      service.register({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: user.email,
        password: 'Password@123',
      }),
    ).resolves.toEqual({
      user: {
        id: user.id,
        email: user.email,
        role: Role.CANDIDATE,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(bcryptHash).toHaveBeenCalledWith('Password@123', 12);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: user.email,
        passwordHash: 'hashed-password',
        role: Role.CANDIDATE,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  });

  it('rejects registration for an existing email', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

    await expect(
      service.register({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: user.email,
        password: 'Password@123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns tokens for a valid login', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    bcryptCompare.mockResolvedValue(true as never);

    await expect(
      service.login({ email: user.email, password: 'Password@123' }),
    ).resolves.toMatchObject({
      user: { id: user.id, email: user.email },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('rejects a login with an invalid password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    bcryptCompare.mockResolvedValue(false as never);

    await expect(
      service.login({ email: user.email, password: 'WrongPassword@123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
