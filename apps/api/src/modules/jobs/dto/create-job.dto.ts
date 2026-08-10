import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EmploymentType } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }: { value: string }) => value.trim())
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  @Transform(({ value }: { value: string }) => value.trim())
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }: { value: string }) => value.trim())
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  salaryMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  experience?: number;

  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;
}
