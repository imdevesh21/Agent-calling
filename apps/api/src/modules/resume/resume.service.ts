import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface UploadedFile {
  originalname: string;
  filename: string;
}

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadResume(userId: string, file: UploadedFile) {
    if (!userId) {
      throw new ForbiddenException('User ID missing from JWT token');
    }

    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
      select: { id: true }, // Only fetch ID for efficiency
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    try {
      return await this.prisma.resume.create({
        data: {
          title: file.originalname,
          fileName: file.filename,
          fileUrl: `/uploads/resumes/${file.filename}`,
          candidateId: candidate.id,
        },
        select: {
          id: true,
          title: true,
          fileUrl: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A resume with this file already exists');
        }
      }
      throw error;
    }
  }

  async getMyResumes(userId: string) {
    if (!userId) {
      throw new ForbiddenException('User ID missing from JWT token');
    }

    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return this.prisma.resume.findMany({
      where: { candidateId: candidate.id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteResume(id: string, userId: string) {
    if (!userId) {
      throw new ForbiddenException('User ID missing from JWT token');
    }

    const candidate = await this.prisma.candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id },
      select: { candidateId: true, fileName: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.candidateId !== candidate.id) {
      throw new ForbiddenException('Not your resume');
    }

    const filePath = path.join(
      process.cwd(),
      'uploads',
      'resumes',
      resume.fileName,
    );

    // Delete file asynchronously
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    await this.prisma.resume.delete({
      where: { id },
    });

    return { message: 'Resume deleted successfully' };
  }
}
