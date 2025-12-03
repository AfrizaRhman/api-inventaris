import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoanDetailDto } from './create-loan-details.dto';

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
