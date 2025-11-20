import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  PaginationDto,
  QueryBuilderOptions,
  SortDirection,
  ColumnFilterDto,
} from '../common/dto/pagination.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { Warehouse } from '@prisma/client';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.warehouse;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'name',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: ['id', 'name', 'address', 'status'],
      allowedFilterFields: ['id', 'name', 'address', 'status'],
      defaultSearchFields: ['name', 'address'],
      softDeleteField: 'deleted_at',
    };
  }

  // CREATE
  async createWarehouse(data: CreateWarehouseDto) {
    return this.create(data);
  }

  // PAGINATION + SELECT FIELDS
  async findAllWarehousesPaginated(paginationDto: PaginationDto) {
    const select = {
      id: true,
      name: true,
      address: true,
      status: true,
      deleted_at: true,
    };

    return this.findAllPaginated(paginationDto, { deleted_at: null }, select);
  }

  // BY ID
  async findWarehouseById(id: string) {
    const warehouse = await this.getModel().findUnique({ where: { id } });

    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return warehouse;
  }

  // UPDATE
  async updateWarehouse(id: string, data: UpdateWarehouseDto) {
    await this.findWarehouseById(id);
    return this.update(id, data);
  }

  // SOFT DELETE
  async softDeleteWarehouse(id: string, deleted_by?: string) {
    await this.findWarehouseById(id);

    return this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
      update_by:   deleted_by,
    });
  }

  // FILTERING
  async getWarehousesByFilter(filters: ColumnFilterDto[]) {
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
