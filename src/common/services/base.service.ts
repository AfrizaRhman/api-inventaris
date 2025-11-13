/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResponse,
  QueryBuilderOptions,
} from '../dto/pagination.dto';
import { QueryBuilderService } from './query-builder.service';

@Injectable()
export abstract class BaseService<T> {
  constructor(protected prismaService: PrismaService) {}

  /**
   * Abstract method to get the Prisma model delegate
   * Each extending service must implement this
   */
  protected abstract getModel(): any;

  /**
   * Abstract method to get query builder options
   * Each extending service can customize the options
   */
  protected abstract getQueryOptions(): QueryBuilderOptions;

  /**
   * Find all records with pagination, search, and filtering
   */
  async findAllPaginated(
    paginationDto: PaginationDto,
    additionalWhere: Record<string, any> = {},
    select?: Record<string, any>,
  ): Promise<PaginatedResponse<T>> {
    const options = this.getQueryOptions();
    const model = this.getModel();

    const {
      skip,
      take,
      where,
      orderBy,
      include,
      select: builtSelect,
      pagination,
    } = QueryBuilderService.buildQueryParams(
      paginationDto,
      options,
      additionalWhere,
      select, // Pass select as parameter
    );

    // Get total count
    const total = await model.count({ where });

    // Determine which select to use - priority: parameter select > built select from options
    const finalSelect = select || builtSelect;

    // Prisma doesn't allow both select and include at the same time
    // If both are provided, select takes priority
    const queryOptions: any = {
      skip,
      take,
      where,
      orderBy,
    };

    if (finalSelect && Object.keys(finalSelect).length > 0) {
      queryOptions.select = finalSelect;
    } else if (include && Object.keys(include).length > 0) {
      queryOptions.include = include;
    }

    // Get paginated data
    const data = await model.findMany(queryOptions);

    return QueryBuilderService.formatPaginatedResponse(
      data,
      total,
      pagination.page,
      pagination.limit,
    );
  }

  /**
   * Find all records (non-paginated)
   */
  async findAll(args: any = {}, includeDeleted = false): Promise<T[]> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const where = {
      ...args.where,
      ...(includeDeleted ? {} : { [softDeleteField]: null }),
    };

    return await model.findMany({
      ...args,
      where,
    });
  }

  /**
   * Find a record by ID
   */
  async findById(
    id: string,
    select?: Record<string, any>,
    includeDeleted = false,
  ): Promise<T | null> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const where = {
      id,
      ...(includeDeleted ? {} : { [softDeleteField]: null }),
    };

    return await model.findUnique({
      where,
      ...(select && { select }),
    });
  }

  /**
   * Create a new record
   */
  async create(data: any, select?: Record<string, any>): Promise<T> {
    const model = this.getModel();

    return await model. create({
      data,
      ...(select && { select }),
    });
  }

  /**
   * Update a record by ID
   */
  async update(
    id: string,
    data: any,
    select?: Record<string, any>,
  ): Promise<T> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const where = {
      id,
      [softDeleteField]: null,
    };

    return await model.update({
      where,
      data: {
        ...data,
        updated_at: Math.floor(Date.now() / 1000), // Unix timestamp
      },
      ...(select && { select }),
    });
  }

  /**
   * Soft delete a record by ID
   */
  async softDelete(id: string): Promise<T> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const where = {
      id,
      [softDeleteField]: null,
    };

    return await model.update({
      where,
      data: {
        [softDeleteField]: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      },
    });
  }

  /**
   * Restore a soft deleted record
   */
  async restore(id: string): Promise<T> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    return await model.update({
      where: { id },
      data: {
        [softDeleteField]: null,
        updated_at: Math.floor(Date.now() / 1000),
      },
    });
  }

  /**
   * Permanently delete a record (hard delete)
   */
  async permanentDelete(id: string): Promise<T> {
    const model = this.getModel();

    return await model.delete({
      where: { id },
    });
  }

  /**
   * Find all records including soft deleted ones
   */
  async findAllWithDeleted(args: any = {}): Promise<T[]> {
    const model = this.getModel();

    return await model.findMany(args);
  }

  /**
   * Find only soft deleted records
   */
  async findDeleted(args: any = {}): Promise<T[]> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const where = {
      ...args.where,
      [softDeleteField]: { not: null },
    };

    return await model.findMany({
      ...args,
      where,
    });
  }

  /**
   * Get soft delete statistics
   */
  async getSoftDeleteStats(): Promise<{
    total: number;
    active: number;
    deleted: number;
  }> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const [total, active] = await Promise.all([
      model.count(),
      model.count({ where: { [softDeleteField]: null } }),
    ]);

    return {
      total,
      active,
      deleted: total - active,
    };
  }
}
