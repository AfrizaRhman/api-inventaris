/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResponse,
  QueryBuilderOptions,
} from '../dto/pagination.dto';
import { QueryBuilderService } from './query-builder.service';

export abstract class BaseService<T> {
  constructor(protected prismaService: PrismaService) { }

  protected abstract getModel(): any;
  protected abstract getQueryOptions(): QueryBuilderOptions;

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
      select,
    );

    const total = await model.count({ where });
    const finalSelect = select || builtSelect;

    const queryOptions: any = { skip, take, where, orderBy };

    // fix orderBy field naming if needed
    if (queryOptions.orderBy && queryOptions.orderBy.createdAt) {
      queryOptions.orderBy = { created_at: queryOptions.orderBy.createdAt };
    }

    if (finalSelect && Object.keys(finalSelect).length > 0) {
      queryOptions.select = finalSelect;
    } else if (include && Object.keys(include).length > 0) {
      queryOptions.include = include;
    }

    const data = await model.findMany(queryOptions);

    return QueryBuilderService.formatPaginatedResponse(
      data,
      total,
      pagination.page,
      pagination.limit,
    );
  }

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

  // NOTE: use findFirst because where may include soft-delete filter
  async findById(
    id: string,
    select?: Record<string, any>,
    includeDeleted = false,
  ): Promise<T | null> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const where: any = {
      id,
      ...(includeDeleted ? {} : { [softDeleteField]: null }),
    };

    return await model.findFirst({
      where,
      ...(select && { select }),
    });
  }

  async create(
    data: any,
    include?: Record<string, any>,
  ): Promise<T> {
    const model = this.getModel();

    return await model.create({
      data,
      ...(include && { include }),
    });
  }

  // Update: ensure record exists first (respecting soft-delete)
  async update(
    id: string,
    data: any,
    select?: Record<string, any>,
  ): Promise<T> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    // ensure the record exists and is not soft-deleted
    const found = await model.findFirst({
      where: {
        id,
        [softDeleteField]: null,
      },
    });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    return await model.update({
      where: { id },
      data: { ...data },
      ...(select && { select }),
    });
  }

  // Soft delete: ensure record exists and not already deleted, then update by id
  async softDelete(id: string): Promise<T> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const found = await model.findFirst({
      where: {
        id,
        [softDeleteField]: null,
      },
    });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found or already deleted.`);
    }

    return await model.update({
      where: { id },
      data: {
        [softDeleteField]: new Date(),
      },
    });
  }

  // Restore: ensure record exists (including deleted), then update by id
  async restore(id: string): Promise<T> {
    const model = this.getModel();
    const options = this.getQueryOptions();
    const { softDeleteField = 'deleted_at' } = options;

    const found = await model.findFirst({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    if (found[softDeleteField] === null) {
      throw new NotFoundException(`Record with ID ${id} is not deleted.`);
    }

    return await model.update({
      where: { id },
      data: {
        [softDeleteField]: null,
      },
    });
  }

  async permanentDelete(id: string): Promise<T> {
    const model = this.getModel();

    // ensure it exists first
    const found = await model.findFirst({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    return await model.delete({
      where: { id },
    });
  }

  async findAllWithDeleted(args: any = {}): Promise<T[]> {
    const model = this.getModel();
    return await model.findMany(args);
  }

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
