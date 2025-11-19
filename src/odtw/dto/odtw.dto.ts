import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail, IsInt, IsBoolean, IsNumber, isString, IsEnum } from 'class-validator';

export class CreateOdtwDto {
  @IsOptional()
  @IsString()
  odtw_code?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  ticket_price: number;

  @IsString()
  address: string;

  @IsString()
  village: string;

  @IsString()
  district: string;

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  longitude?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsEnum(['active', 'inactive'])
  status: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  account_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}

export class UpdateOdtwDto extends PartialType(CreateOdtwDto) {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  updated_by?: string;
}

export class OdtwResponseDto {
  id: string;
  name: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  phone?: string;
  email: string;
  longitude: string;
  latitude: string;
  created_at: number;
  updated_at: number;
  deleted_at?: number;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
} 