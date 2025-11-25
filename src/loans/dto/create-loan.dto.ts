import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoanDetailDto } from './create-loan_detail.dto';

export class CreateLoanDto {
  @IsString()
  name: string;

  @IsString()
  phone_number: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  necessity?: string | null;

  @IsOptional()
  @IsString()
  note?: string | null;

  @IsOptional()
  @IsDateString()
  loan_date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanDetailDto)
  details: LoanDetailDto[];
}
