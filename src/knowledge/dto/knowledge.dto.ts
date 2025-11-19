import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  odtw_id: string;

  @IsString()
  topic_code: string;

  @IsString()
  topic: string;

  @IsString()
  content: string;

  @IsString()
  @IsEnum(['active', 'inactive'])
  status: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}

export class UpdateKnowledgeDto extends PartialType(CreateKnowledgeDto) {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;
}

export class KnowledgeResponseDto {
  id: string;
  odtw_id: string;
  topic_code: string;
  topic: string;
  content: string;
  
  created_at: number;
  updated_at: number;
  deleted_at?: number;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
} 