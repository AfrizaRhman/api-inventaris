import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  odtw_id: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}

export class UpdateVisitorDto extends PartialType(CreateVisitorDto) {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;
}

export class VisitorResponseDto {
  id: string;
  odtw_id: string;
  phone: string;
  name: string;
  
  created_at: number;
  updated_at: number;
  deleted_at?: number;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
} 