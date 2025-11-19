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
   * Build query parameters for Prisma
   */
  static buildQueryParams(
    paginationDto: PaginationDto,
    options: QueryBuilderOptions,
    additionalWhere: Record<string, any> = {},
    select?: Record<string, any>,
  ) {
    // Ensure paginationDto is always an object to avoid destructuring errors
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

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build order by
    const finalSortField = allowedSortFields.includes(sortField || '')
      ? sortField
      : defaultSortField;
    const finalSortDirection = sortDirection || defaultSortDirection;

    const orderBy = finalSortField
      ? { [finalSortField]: finalSortDirection }
      : undefined;

    // Build where clause - start with soft delete filter
    const baseWhere: any = {};

    // Initialize conditions array for complex AND/OR logic
    const whereConditions: any[] = [];

    // Add additionalWhere first (this can contain complex relational filters)
    if (additionalWhere && Object.keys(additionalWhere).length > 0) {
      whereConditions.push(additionalWhere);
    }

    // Add search conditions with support for relation fields (dot notation)
    if (search && search.trim()) {
      const searchFieldsToUse = searchFields?.length
        ? searchFields
        : defaultSearchFields;

      if (searchFieldsToUse.length > 0) {
        const searchConditions = this.buildSearchConditions(
          searchFieldsToUse,
          search.trim(),
        );
        if (searchConditions.length > 0) {
          whereConditions.push({ OR: searchConditions });
        }
      }
    }

    // Add column filters
    const filterConditions: any = {};
    if (filters && filters.length > 0) {
      filters.forEach((filter: ColumnFilterDto) => {
        if (allowedFilterFields.includes(filter.field)) {
          const condition = this.buildFilterCondition(filter);
          if (condition !== undefined) {
            filterConditions[filter.field] = condition;
          }
        }
      });
    }

    if (Object.keys(filterConditions).length > 0) {
      whereConditions.push(filterConditions);
    }

    console.log('Where Conditions:', whereConditions);

    // Combine all conditions
    // let where: any = {
    //   [softDeleteField]: null, // Always include soft delete filter
    // };

    let where: any = {};

    if (whereConditions.length > 0) {
      if (whereConditions.length === 1) {
        // Single condition, merge directly
        where = { ...where, ...whereConditions[0] };
      } else {
        // Multiple conditions, use AND
        where.AND = whereConditions;
      }
    }

    // Build include clause
    let finalInclude = defaultInclude;
    if (include && typeof include === 'object') {
      // If allowedIncludes is specified, validate the include object
      if (allowedIncludes.length > 0) {
        finalInclude = this.validateAndBuildInclude(include, allowedIncludes);
        // Merge with default includes
        finalInclude = { ...defaultInclude, ...finalInclude };
      } else {
        // If no restrictions, use the provided include
        finalInclude = { ...defaultInclude, ...include };
      }
    }

    // Build select clause
    let finalSelect = defaultSelect;
    if (select && typeof select === 'object') {
      // If allowedSelectFields is specified, validate the select object
      if (allowedSelectFields.length > 0) {
        finalSelect = this.validateAndBuildSelect(select, allowedSelectFields);
        // Merge with default select
        finalSelect = { ...defaultSelect, ...finalSelect };
      } else {
        // If no restrictions, use the provided select
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

  /**
   * Build filter condition based on filter type
   */
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
        return { not: { equals: value } };
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
        return values ? { in: values } : undefined;
      case FilterCondition.NOT_IN:
        return values ? { notIn: values } : undefined;
      case FilterCondition.BETWEEN:
        return values && values.length === 2
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

  /**
   * Format paginated response
   */
  static formatPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Validate and build include object based on allowed includes
   */
  static validateAndBuildInclude(
    include: Record<string, any>,
    allowedIncludes: string[],
  ): Record<string, any> {
    const result: Record<string, any> = {};

    // Process each key in the include object
    for (const [key, value] of Object.entries(include)) {
      if (allowedIncludes.includes(key)) {
        if (value === true || value === false) {
          // Simple boolean include
          result[key] = value;
        } else if (
          typeof value === 'object' &&
          value !== null &&
          value.include
        ) {
          // Nested include object - pass it through as is since we're not restricting nested paths
          result[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // If it's an object but not with include property, wrap it
          result[key] = { include: value };
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Build search conditions with support for relation fields (dot notation)
   */
  static buildSearchConditions(
    searchFields: string[],
    searchTerm: string,
  ): any[] {
    const conditions: any[] = [];

    for (const field of searchFields) {
      if (field.includes('.')) {
        // Handle relation field (e.g., "owner.name", "pic.email")
        const [relation, relationField] = field.split('.', 2);
        conditions.push({
          [relation]: {
            [relationField]: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        });
      } else {
        // Handle direct field
        conditions.push({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        });
      }
    }

    return conditions;
  }

  /**
   * Validate and build select object based on allowed select fields
   */
  static validateAndBuildSelect(
    select: Record<string, any>,
    allowedSelectFields: string[],
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(select)) {
      if (allowedSelectFields.includes(key)) {
        if (typeof value === 'boolean') {
          result[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested select (for relations)
          result[key] = value;
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Helper methods for building common relational query patterns
   */
  
  /**
   * Filter by relation existence (some/none)
   * @param relationName - Name of the relation field
   * @param condition - 'some', 'none', or 'every'
   * @param filters - Optional filters to apply to the relation
   */
  static relationExists(
    relationName: string,
    condition: 'some' | 'none' | 'every' = 'some',
    filters?: Record<string, any>,
  ): Record<string, any> {
    return {
      [relationName]: {
        [condition]: filters || {},
      },
    };
  }

  /**
   * Filter by relation count
   * Note: Prisma doesn't support direct count filtering in where clause
   * This is a placeholder for future implementation with aggregations
   */
  static relationCount(
    relationName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'equals',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    count: number,
  ): Record<string, any> {
    return {
      [relationName]: {
        some: {},
      },
    };
  }

  /**
   * Filter by nested relation properties
   * @param relationPath - Dot-separated path (e.g., 'property.owner.name')
   * @param condition - Prisma condition object
   */
  static nestedRelationFilter(
    relationPath: string,
    condition: Record<string, any>,
  ): Record<string, any> {
    const parts = relationPath.split('.');
    let result = condition;

    // Build nested structure from right to left
    for (let i = parts.length - 1; i >= 0; i--) {
      result = {
        [parts[i]]: result,
      };
    }

    return result;
  }

  /**
   * Combine multiple relation filters with AND/OR logic
   * @param operator - 'AND' or 'OR'
   * @param conditions - Array of condition objects
   */
  static combineConditions(
    operator: 'AND' | 'OR',
    conditions: Record<string, any>[],
  ): Record<string, any> {
    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];

    return {
      [operator]: conditions,
    };
  }

  /**
   * Build a complex relation filter for property-rental unit relationships
   * Example patterns based on the schema
   */
  static buildPropertyRelationFilter(options: {
    ownerName?: string;
    picName?: string;
    hasReadyUnits?: boolean;
    unitCount?: { operator: 'gt' | 'gte' | 'lt' | 'lte'; value: number };
    priceRange?: { min: number; max: number };
    category?: string[];
  }): Record<string, any> {
    const conditions: Record<string, any>[] = [];

    // Filter by owner name
    if (options.ownerName) {
      conditions.push({
        owner: {
          name: {
            contains: options.ownerName,
            mode: 'insensitive',
          },
        },
      });
    }

    // Filter by PIC name
    if (options.picName) {
      conditions.push({
        pic: {
          name: {
            contains: options.picName,
            mode: 'insensitive',
          },
        },
      });
    }

    // Filter by properties that have ready rental units
    if (options.hasReadyUnits) {
      conditions.push({
        rental_units: {
          some: {
            status: 'ready',
          },
        },
      });
    }

    // Filter by price range in rental units
    if (options.priceRange) {
      conditions.push({
        rental_units: {
          some: {
            prices: {
              some: {
                AND: [
                  { amount: { gte: options.priceRange.min } },
                  { amount: { lte: options.priceRange.max } },
                ],
              },
            },
          },
        },
      });
    }

    // Filter by category
    if (options.category && options.category.length > 0) {
      conditions.push({
        category: {
          in: options.category,
        },
      });
    }

    return this.combineConditions('AND', conditions);
  }

  /**
   * Build a complex relation filter for rental unit queries
   */
  static buildRentalUnitRelationFilter(options: {
    propertyOwnerName?: string;
    propertyName?: string;
    propertyCategory?: string[];
    hasImages?: boolean;
    priceRange?: { min: number; max: number };
    availableCapacity?: number;
    propertyLocation?: { city?: string; province?: string };
  }): Record<string, any> {
    const conditions: Record<string, any>[] = [];

    // Filter by property owner name
    if (options.propertyOwnerName) {
      conditions.push({
        property: {
          owner: {
            name: {
              contains: options.propertyOwnerName,
              mode: 'insensitive',
            },
          },
        },
      });
    }

    // Filter by property name
    if (options.propertyName) {
      conditions.push({
        property: {
          name: {
            contains: options.propertyName,
            mode: 'insensitive',
          },
        },
      });
    }

    // Filter by property category
    if (options.propertyCategory && options.propertyCategory.length > 0) {
      conditions.push({
        property: {
          category: {
            in: options.propertyCategory,
          },
        },
      });
    }

    // Filter by rental units that have gallery images
    if (options.hasImages) {
      conditions.push({
        galleries: {
          some: {},
        },
      });
    }

    // Filter by price range
    if (options.priceRange) {
      conditions.push({
        prices: {
          some: {
            AND: [
              { amount: { gte: options.priceRange.min } },
              { amount: { lte: options.priceRange.max } },
            ],
          },
        },
      });
    }

    // Filter by capacity
    if (options.availableCapacity) {
      conditions.push({
        capacity: {
          gte: options.availableCapacity,
        },
      });
    }

    // Filter by property location
    if (options.propertyLocation) {
      const locationConditions: Record<string, any>[] = [];
      
      if (options.propertyLocation.city) {
        locationConditions.push({
          city: {
            contains: options.propertyLocation.city,
            mode: 'insensitive',
          },
        });
      }

      if (options.propertyLocation.province) {
        locationConditions.push({
          province: {
            contains: options.propertyLocation.province,
            mode: 'insensitive',
          },
        });
      }

      if (locationConditions.length > 0) {
        conditions.push({
          property: this.combineConditions('AND', locationConditions),
        });
      }
    }

    return this.combineConditions('AND', conditions);
  }
}
