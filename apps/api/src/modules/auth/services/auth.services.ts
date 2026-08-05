import { Injectable, ConflictException } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    return {
      success: true,
      message: 'Email is available',
    };
  }
}
