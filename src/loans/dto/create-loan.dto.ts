import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoanDetailDto {
  @IsInt()
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

export class CreateLoanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  necessity?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  loan_date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanDetailDto)
  details: LoanDetailDto[];
}
