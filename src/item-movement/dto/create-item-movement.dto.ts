import { IsString, IsNotEmpty, IsDateString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemMovementDetailDto {
  @IsInt()
  sku_id: number;

  @IsString()
  @IsNotEmpty()
  sku_code: string;
}

export class CreateItemMovementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  phone_number: string;

  @IsString()
  email: string;

  @IsString()
  necessity: string;

  @IsDateString()
  request_date: string;

  @IsInt()
  created_by: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemMovementDetailDto)
  details: ItemMovementDetailDto[];
}
