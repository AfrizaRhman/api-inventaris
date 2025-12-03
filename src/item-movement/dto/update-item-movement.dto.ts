import { PartialType } from '@nestjs/mapped-types';
import { CreateItemMovementDto } from './create-item-movement.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateItemMovementDto extends PartialType(CreateItemMovementDto) {
  @IsString()
  @IsOptional()
  updated_by?: string; // prisma: String?
}