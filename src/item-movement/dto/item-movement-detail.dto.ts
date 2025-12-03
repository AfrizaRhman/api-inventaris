import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ItemMovementDetailDto {
  @IsString()
  @IsNotEmpty()
  sku_id: string;

  @IsString()
  @IsOptional()
  sku_code?: string;
}