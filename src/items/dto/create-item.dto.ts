import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsNotEmpty()
  @IsInt()
  stock: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  image?: string;

  // RELATION FIELD
  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsOptional()
  @IsString()
  warehouse_id?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}
