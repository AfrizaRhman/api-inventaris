import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemMovementDetailDto {
  @IsString()
  @IsNotEmpty()
  sku_id: string;

  @IsString()
  sku_code: string;

  @IsNumber()
  qty: number;

  @IsString()
  description: string;
  item_id: any;
}