/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  PaginationDto,
  PaginatedResponse,
  QueryBuilderOptions,
  FilterCondition,
  SortDirection,
  ColumnFilterDto,
} from '../dto/pagination.dto';

export class QueryBuilderService {
  /**
   * Build query parameters for Prisma (FINAL & AMAN)
   */
  static buildQueryParams(
    paginationDto: PaginationDto,
    options: QueryBuilderOptions,
    additionalWhere: Record<string, any> = {},
    select?: Record<string, any>,
  ) {
    const safeDto =
      paginationDto && typeof paginationDto === 'object' ? paginationDto : {};

    const {
      page = 1,
      limit = 10,
      sortField,
      sortDirection = SortDirection.ASC,
      search,
      searchFields,
      filters = [],
      include,
    } = safeDto;

    const {
      defaultSortField = 'created_at',
      defaultSortDirection = SortDirection.DESC,
      allowedSortFields = [],
      allowedFilterFields = [],
      defaultSearchFields = [],
      softDeleteField = 'deleted_at',
      defaultInclude = {},
      allowedIncludes = [],
      defaultSelect = {},
      allowedSelectFields = [],
    } = options;

    const skip = (page - 1) * limit;
    const take = limit;

    /* =======================
       ORDER BY
    ======================== */
    const finalSortField =
      sortField && allowedSortFields.includes(sortField)
        ? sortField
        : defaultSortField;

    const finalSortDirection = sortDirection ?? defaultSortDirection;

    const orderBy = finalSortField
      ? { [finalSortField]: finalSortDirection }
      : undefined;

    /* =======================
       WHERE
    ======================== */
    const whereConditions: any[] = [];

    // soft delete
    const baseWhere: any = {
      [softDeleteField]: null,
    };

    // additional where
    if (additionalWhere && Object.keys(additionalWhere).length > 0) {
      whereConditions.push(additionalWhere);
    }

    // search
    if (search && search.trim()) {
      const fields = searchFields?.length
        ? searchFields
        : defaultSearchFields;

      if (fields.length > 0) {
        whereConditions.push({
          OR: this.buildSearchConditions(fields, search.trim()),
        });
      }
    }

    // column filters
    if (filters.length > 0) {
      const filterConditions: Record<string, any> = {};

      filters.forEach((filter: ColumnFilterDto) => {
        if (allowedFilterFields.includes(filter.field)) {
          const condition = this.buildFilterCondition(filter);
          if (condition !== undefined) {
            filterConditions[filter.field] = condition;
          }
        }
      });

      if (Object.keys(filterConditions).length > 0) {
        whereConditions.push(filterConditions);
      }
    }

    let where: any = { ...baseWhere };

    if (whereConditions.length === 1) {
      where = { ...where, ...whereConditions[0] };
    } else if (whereConditions.length > 1) {
      where.AND = whereConditions;
    }

    /* =======================
       INCLUDE
    ======================== */
    let finalInclude = defaultInclude;

    if (include && typeof include === 'object') {
      if (allowedIncludes.length > 0) {
        finalInclude = {
          ...defaultInclude,
          ...this.validateAndBuildInclude(include, allowedIncludes),
        };
      } else {
        finalInclude = { ...defaultInclude, ...include };
      }
    }

    /* =======================
       SELECT
    ======================== */
    let finalSelect = defaultSelect;

    if (select && typeof select === 'object') {
      if (allowedSelectFields.length > 0) {
        finalSelect = {
          ...defaultSelect,
          ...this.validateAndBuildSelect(select, allowedSelectFields),
        };
      } else {
        finalSelect = { ...defaultSelect, ...select };
      }
    }

    return {
      skip,
      take,
      where,
      orderBy,
      include: finalInclude,
      select: finalSelect,
      pagination: { page, limit },
    };
  }

  /* =======================
     FILTER CONDITION
  ======================== */
  private static buildFilterCondition(filter: ColumnFilterDto): any {
    const { condition, value, values } = filter;

    switch (condition) {
      case FilterCondition.CONTAIN:
        return { contains: value, mode: 'insensitive' };
      case FilterCondition.NOT_CONTAIN:
        return { not: { contains: value, mode: 'insensitive' } };
      case FilterCondition.EQUAL:
        return { equals: value };
      case FilterCondition.NOT_EQUAL:
        return { not: value };
      case FilterCondition.START_WITH:
        return { startsWith: value, mode: 'insensitive' };
      case FilterCondition.END_WITH:
        return { endsWith: value, mode: 'insensitive' };
      case FilterCondition.IS_NULL:
        return null;
      case FilterCondition.IS_NOT_NULL:
        return { not: null };
      case FilterCondition.GREATER_THAN:
        return { gt: value };
      case FilterCondition.GREATER_THAN_OR_EQUAL:
        return { gte: value };
      case FilterCondition.LESS_THAN:
        return { lt: value };
      case FilterCondition.LESS_THAN_OR_EQUAL:
        return { lte: value };
      case FilterCondition.IN:
        return values?.length ? { in: values } : undefined;
      case FilterCondition.NOT_IN:
        return values?.length ? { notIn: values } : undefined;
      case FilterCondition.BETWEEN:
        return values?.length === 2
          ? { gte: values[0], lte: values[1] }
          : undefined;
      case FilterCondition.DATE_AFTER:
        return { gt: new Date(value) };
      case FilterCondition.DATE_BEFORE:
        return { lt: new Date(value) };
      default:
        return undefined;
    }
  }

  /* =======================
     PAGINATION RESPONSE
  ======================== */
  static formatPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /* =======================
     INCLUDE VALIDATION
  ======================== */
  static validateAndBuildInclude(
    include: Record<string, any>,
    allowedIncludes: string[],
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(include)) {
      if (allowedIncludes.includes(key)) {
        result[key] = value;
      }
    }

    return result;
  }

  /* =======================
     SEARCH CONDITIONS
  ======================== */
  static buildSearchConditions(
    fields: string[],
    searchTerm: string,
  ): any[] {
    return fields.map((field) => {
      if (field.includes('.')) {
        const [relation, relationField] = field.split('.', 2);
        return {
          [relation]: {
            [relationField]: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        };
      }

      return {
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      };
    });
  }

  /* =======================
     SELECT VALIDATION
  ======================== */
  static validateAndBuildSelect(
    select: Record<string, any>,
    allowedSelectFields: string[],
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key of allowedSelectFields) {
      if (key in select) {
        result[key] = select[key];
      }
    }

    return result;
  }
}
