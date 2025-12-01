import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSkuDto {
  @IsString()
  @IsNotEmpty()
  item_id: string;

  @IsString()
  @IsNotEmpty()
  warehouse_id: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsOptional()
  status?: string = 'available';
}
