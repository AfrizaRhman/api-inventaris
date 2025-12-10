/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { NotFoundException, BadRequestException } from '@nestjs/common';
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
     PAGINATION
  ============================================================ */

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

  /* ============================================================
     FINDERS
  ============================================================ */

  async findAll(args: any = {}, includeDeleted = false): Promise<T[]> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const where = {
      ...args.where,
      ...(includeDeleted ? {} : { [field]: null }),
    };

    return await model.findMany({ ...args, where });
  }

  async findById(
    id: string,
    select?: Record<string, any>,
    includeDeleted = false,
  ): Promise<T | null> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const where: any = {
      id,
      ...(includeDeleted ? {} : { [field]: null }),
    };

    return await model.findFirst({
      where,
      ...(select && { select }),
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
    const model = this.getModel();

    return await model.create({
      data,
      ...(include && { include }),
    });
  }

  async update(id: string, data: any, select?: Record<string, any>): Promise<T> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const found = await model.findFirst({
      where: { id, [field]: null },
    });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    return await model.update({
      where: { id },
      data,
      ...(select && { select }),
    });
  }

  /* ============================================================
     SOFT DELETE
  ============================================================ */

  async softDelete(id: string): Promise<T> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const found = await model.findFirst({
      where: { id, [field]: null },
    });

    if (!found) {
      throw new NotFoundException(
        `Record with ID ${id} not found or already deleted.`,
      );
    }

    return model.update({
      where: { id },
      data: { [field]: new Date() },
    });
  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async restore(id: string): Promise<T> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const found = await model.findFirst({
      where: { id, [field]: { not: null } },
    });

    if (!found) {
      throw new NotFoundException(
        `Record with ID ${id} not found or not deleted.`,
      );
    }

    return model.update({
      where: { id },
      data: { [field]: null },
    });
  }

  /* ============================================================
     HARD DELETE
  ============================================================ */
  async hardDelete(id: string): Promise<void> {
    const model = this.getModel();

    const found = await model.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }

    await model.delete({ where: { id } });
  }
  
  /* ============================================================
     EXTRA HELPERS
  ============================================================ */

  async findAllWithDeleted(args: any = {}): Promise<T[]> {
    const model = this.getModel();
    return await model.findMany(args);
  }

  async findDeleted(args: any = {}): Promise<T[]> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const where = {
      ...args.where,
      [field]: { not: null },
    };

    return await model.findMany({ ...args, where });
  }

  async getSoftDeleteStats(): Promise<{
    total: number;
    active: number;
    deleted: number;
  }> {
    const model = this.getModel();
    const { softDeleteField = 'deleted_at' } = this.getQueryOptions();
    const field = softDeleteField as string;

    const [total, active] = await Promise.all([
      model.count(),
      model.count({ where: { [field]: null } }),
    ]);

    return {
      total,
      active,
      deleted: total - active,
    };
  }
}
