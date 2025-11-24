import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  PaginationDto,
  QueryBuilderOptions,
  SortDirection,
  ColumnFilterDto,
} from '../common/dto/pagination.dto';
import { CreateSkuDto } from './dto/create-sku.dto';
import { UpdateSkuDto } from './dto/update-sku.dto';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { Sku } from '@prisma/client';

@Injectable()
export class SkuService extends BaseService<Sku> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.sku;
  }

  protected getQueryOptions(): QueryBuilderOptions {
  return {
    defaultSortField: 'code',
    defaultSortDirection: SortDirection.DESC,
    allowedSortFields: ['id', 'code', 'status'],
    allowedFilterFields: ['id', 'code', 'status', 'item_id', 'warehouse_id'],
    defaultSearchFields: ['code'],
    softDeleteField: 'deleted_at', // kalau SKU tidak pakai soft delete, hapus saja
  };
}


  // CREATE
  async createSku(data: CreateSkuDto) {
    return this.create(data);
  }

  // PAGINATION + SELECT FIELDS
  async findAllSkusPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      item_id: true,
      code: true,
      color: true,
      status: true,
      warehouse_id: true,
      deleted_at: true,
    };

    return this.findAllPaginated(paginationDto, { deleted_at: null }, select);
  }

  // DETAIL
  async findSkuById(id: string) {
    const sku = await this.getModel().findFirst({
      where: { id, deleted_at: null },
      include: {
        item: true,
        warehouse: true,
      },
    });

    if (!sku) throw new NotFoundException('SKU not found');

    return sku;
  }

  // UPDATE
  async updateSku(id: string, data: UpdateSkuDto) {
    await this.findSkuById(id);

    return this.update(id, data);
  }

  // SOFT DELETE
  async softDeleteSku(id: string, deleted_by?: string) {
    await this.findSkuById(id);

    return this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
      // if you have updated_by field, use updated_by: deleted_by
    });
  }

  // FILTERING
  async getSkusByFilter(filters: ColumnFilterDto[]) {
    const queryParams = QueryBuilderService.buildQueryParams(
      { filters } as PaginationDto,
      this.getQueryOptions(),
    );

    return this.findAll(queryParams);
  }

  // GET ALL INCLUDING DELETED
  async findAllWithDeleted(select: any) {
    return this.getModel().findMany({ select });
  }
}
