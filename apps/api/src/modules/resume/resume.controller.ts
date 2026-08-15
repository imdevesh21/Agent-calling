import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResumeService } from './resume.service';
import { multerConfig } from './multer.config';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) { }

  @Post()
  @UseInterceptors(FileInterceptor('resume', multerConfig))
  uploadResume(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    const userId = req.user.id;

    return this.resumeService.uploadResume(userId, file);
  }

  @Get('me')
  getMyResumes(@Req() req: any) {
    console.log('req.user in controller:', req.user);
    const userId = req.user.id;
    return this.resumeService.getMyResumes(userId);
  }
  @Delete(':id')
  deleteResume(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    console.log('REQ.USER:', req.user);

    const userId =
      req.user?.id ??
      req.user?.sub ??
      req.user?.userId;

    console.log('DELETE REQUEST');
    console.log('Resume ID:', id);
    console.log('JWT User ID:', userId);

    return this.resumeService.deleteResume(id, userId);
  }
}
