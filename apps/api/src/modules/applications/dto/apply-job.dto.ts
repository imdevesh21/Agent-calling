import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  resumeId: string;
}
