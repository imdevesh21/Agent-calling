import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class OnboardRecruiterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }: { value: string }) => value.trim())
  organizationName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  @Transform(({ value }: { value: string }) => value.trim())
  organizationDescription?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_048)
  organizationWebsite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value.trim())
  organizationIndustry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }: { value: string }) => value.trim())
  organizationLocation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  organizationSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }: { value: string }) => value.trim())
  designation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }: { value: string }) => value.trim())
  phone?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_048)
  linkedinUrl?: string;
}
