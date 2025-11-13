import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum FilterCondition {
  CONTAIN = 'contain',
  NOT_CONTAIN = 'not_contain',
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  START_WITH = 'start_with',
  END_WITH = 'end_with',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  DATE_AFTER = 'date_after',
  DATE_BEFORE = 'date_before',
}

export class ColumnFilterDto {
  @IsString()
  field: string;

  @IsEnum(FilterCondition)
  condition: FilterCondition;

  @IsOptional()
  value?: any;

  @IsOptional()
  @IsArray()
  values?: any[]; // For IN, NOT_IN, BETWEEN conditions
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(value) ? value : [];
  })
  searchFields?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnFilterDto)
  filters?: ColumnFilterDto[];

  @IsOptional()
  include?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QueryBuilderOptions {
  defaultSortField?: string;
  defaultSortDirection?: SortDirection;
  allowedSortFields?: string[];
  allowedFilterFields?: string[];
  defaultSearchFields?: string[];
  softDeleteField?: string;
  defaultInclude?: Record<string, any>;
  allowedIncludes?: string[];
  defaultSelect?: Record<string, any>;
  allowedSelectFields?: string[];
}
