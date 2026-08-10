import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCandidateDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  experience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  expectedSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  noticePeriod?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  currentCompany?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_048)
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_048)
  githubUrl?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_048)
  portfolioUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(100, { each: true })
  skills?: string[];
}
