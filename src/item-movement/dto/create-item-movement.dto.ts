import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemMovementDetailDto } from './item-movement-detail.dto';

export class CreateItemMovementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  necessity?: string;

  @IsDateString()
  @IsOptional()
  request_date?: string;

  @IsString()
  @IsOptional()
  created_by?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemMovementDetailDto)
  details: ItemMovementDetailDto[];
}
