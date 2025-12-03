import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';


export class LoanDetailDto {
  @IsString()
  sku_id: string;

  @IsInt()
  qty: number;

  @IsOptional()
  @IsDateString()
  return_date?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
