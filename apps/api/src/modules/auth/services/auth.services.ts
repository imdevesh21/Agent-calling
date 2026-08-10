import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import {
  AuthenticatedUser,
  AuthResponse,
  AuthTokens,
  JwtPayload,
} from '../interfaces/auth.interface';

@Injectable()
export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      AuthService.SALT_ROUNDS,
    );

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        role: Role.CANDIDATE,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      },
    });

    return this.createAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (
      !user ||
      !(await bcrypt.compare(loginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account is inactive');
    }

    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.createAuthResponse(user);
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.issueTokens(user);

    return {
      user: this.toAuthenticatedUser(user),
      ...tokens,
    };
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const basePayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessPayload: JwtPayload = {
      ...basePayload,
      tokenType: 'access',
    };
    const refreshPayload: JwtPayload = {
      ...basePayload,
      tokenType: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.getExpiration('jwt.accessExpires'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.getExpiration('jwt.refreshExpires'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private getExpiration(key: 'jwt.accessExpires' | 'jwt.refreshExpires') {
    return this.configService.getOrThrow<string>(
      key,
    ) as JwtSignOptions['expiresIn'];
  }
}
