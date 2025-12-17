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
  constructor(protected prismaService: PrismaService) {}

  protected abstract getModel(): any;
  protected abstract getQueryOptions(): QueryBuilderOptions;

  /* ============================================================
     PAGINATION (SAFE FOR ALL MODELS)
  ============================================================ */
  async findAllPaginated(
  paginationDto: PaginationDto,
  additionalWhere: Record<string, any> = {},
  include?: Record<string, any>,
): Promise<PaginatedResponse<T>> {
  const options = this.getQueryOptions();
  const model = this.getModel();

  const {
    skip,
    take,
    where,
    orderBy,
    pagination,
  } = QueryBuilderService.buildQueryParams(
    paginationDto,
    options,
    additionalWhere,
  );

  const total = await model.count({ where });

  const queryOptions: any = {
    skip,
    take,
    where,
    orderBy, // 👈 langsung pakai
  };

  if (include && Object.keys(include).length > 0) {
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


  /* ============================================================
     FINDERS
  ============================================================ */
  async findAll(args: any = {}, includeDeleted = false): Promise<T[]> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    const where = {
      ...args.where,
      ...(includeDeleted ? {} : { [softDeleteField]: null }),
    };

    return model.findMany({ ...args, where });
  }

  async findById(
    id: string,
    include?: Record<string, any>,
    includeDeleted = false,
  ): Promise<T | null> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    const where: any = {
      id,
      ...(includeDeleted ? {} : { [softDeleteField]: null }),
    };

    return model.findFirst({
      where,
      ...(include && { include }),
    });
  }

  async findIncludingDeleted(id: string): Promise<T> {
    const model = this.getModel();

    const found = await model.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    return found;
  }

  /* ============================================================
     CREATE / UPDATE
  ============================================================ */
  async create(data: any, include?: Record<string, any>): Promise<T> {
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    return this.getModel().create({
      data: {
        ...data,
        [softDeleteField]: null,
      },
      ...(include && { include }),
    });
  }

  async update(
    id: string,
    data: any,
    include?: Record<string, any>,
  ): Promise<T> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    const found = await model.findFirst({
      where: { id, [softDeleteField]: null },
    });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    return model.update({
      where: { id },
      data,
      ...(include && { include }),
    });
  }

  /* ============================================================
     SOFT DELETE / RESTORE / HARD DELETE
  ============================================================ */
  async softDelete(id: string): Promise<T> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    const found = await model.findFirst({
      where: { id, [softDeleteField]: null },
    });

    if (!found) {
      throw new NotFoundException(
        `Record with ID ${id} not found or already deleted.`,
      );
    }

    return model.update({
      where: { id },
      data: { [softDeleteField]: new Date() },
    });
  }

  async restore(id: string): Promise<T> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    const found = await model.findFirst({
      where: { id, [softDeleteField]: { not: null } },
    });

    if (!found) {
      throw new NotFoundException(
        `Record with ID ${id} not found or not deleted.`,
      );
    }

    return model.update({
      where: { id },
      data: { [softDeleteField]: null },
    });
  }

  async hardDelete(id: string): Promise<void> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    const found = await model.findFirst({
      where: { id, [softDeleteField]: { not: null } },
    });

    if (!found) {
      throw new NotFoundException(
        `Record with ID ${id} not found or not soft deleted.`,
      );
    }

    await model.delete({ where: { id } });
  }

  /* ============================================================
     EXTRA
  ============================================================ */
  async findAllWithDeleted(args: any = {}): Promise<T[]> {
    return this.getModel().findMany(args);
  }

  async findDeleted(args: any = {}): Promise<T[]> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();

    return model.findMany({
      ...args,
      where: {
        ...args.where,
        [softDeleteField]: { not: null },
      },
    });
  }
}
