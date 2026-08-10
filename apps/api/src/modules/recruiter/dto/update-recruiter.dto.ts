import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateRecruiterDto {
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

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_048)
  profileImage?: string;
}
