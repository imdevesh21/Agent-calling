<<<<<<< HEAD
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import type { AuthenticatedUser } from '../interfaces/auth.interface';
=======
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthenticatedUser } from '../interfaces/auth.interface';
>>>>>>> 40dc74ad751797cde79749c81472449a56e8cb82
import { AuthService } from '../services/auth.services';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Get('me')
<<<<<<< HEAD
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
=======
  @UseGuards(JwtAuthGuard, RolesGuard)
  me(@Req() request: Request & { user: AuthenticatedUser }) {
    return request.user;
>>>>>>> 40dc74ad751797cde79749c81472449a56e8cb82
  }
}
