import { IsString, IsUUID, IsInt, IsOptional, IsDateString } from 'class-validator';

export class LoanDetailDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  sku_id: string;

  @IsInt()
  qty: number;

  @IsOptional()
  @IsDateString()
  return_date?: string | null;

  @IsOptional()
  @IsString()
  status?: string;
}
