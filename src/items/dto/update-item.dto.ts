import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsOptional()
  @IsString()
  updated_by?: string;
}
