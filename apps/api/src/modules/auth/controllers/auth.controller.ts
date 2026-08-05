import { Body, Controller, Post } from '@nestjs/common';

import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.services';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
