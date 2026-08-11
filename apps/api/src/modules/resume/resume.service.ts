import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadResume(
    userId: string,
    file: any,
  ) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.create({
      data: {
        fileName: file.originalname,
        fileUrl: `/uploads/resumes/${file.filename}`,
        candidateId: candidate.id,
      },
    });

    return {
      message: 'Resume uploaded successfully',
      resume,
    };
  }

  async getMyResumes(userId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return this.prisma.resume.findMany({
      where: { candidateId: candidate.id },
      orderBy: { id: 'desc' },
    });
  }

  async deleteResume(userId: string, resumeId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.candidateId !== candidate.id) {
      throw new ForbiddenException('You cannot delete this resume');
    }

    await this.prisma.resume.delete({
      where: { id: resumeId },
    });

    return {
      message: 'Resume deleted successfully',
    };
  }
}
