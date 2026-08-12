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
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('resume', multerConfig))
  uploadResume(@UploadedFile() file: any, @Req() req: any) {
    const userId = req.user.id;
    return this.resumeService.uploadResume(userId, file);
  }

  @Get('me')
  getMyResumes(@Req() req: any) {
    return this.resumeService.getMyResumes(req.user.id);
  }

  @Delete(':id')
  deleteResume(@Param('id') id: string, @Req() req: any) {
    return this.resumeService.deleteResume(req.user.id, id);
  }
}
