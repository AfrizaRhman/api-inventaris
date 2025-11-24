import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';

import {
  QueryBuilderOptions,
  PaginationDto,
  SortDirection,
  ColumnFilterDto,
} from '../common/dto/pagination.dto';

import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';

import { ItemMovement } from '@prisma/client';
import { QueryBuilderService } from '../common/services/query-builder.service';

@Injectable()
export class ItemMovementService extends BaseService<ItemMovement> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  // gunakan same pattern seperti ODTW: this.prismaService.db
  protected getModel() {
    return (this.prismaService.db as any).itemMovement;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'name',
      defaultSortDirection: SortDirection.ASC,
      allowedSortFields: [
        'id',
        'name',
        'memo_number',
        'email',
        'necessity',
        'request_date',
        'created_by',
        'updated_by',
      ],
      allowedFilterFields: [
        'id',
        'name',
        'memo_number',
        'email',
        'necessity',
        'request_date',
        'created_by',
        'updated_by',
      ],
      defaultSearchFields: ['name', 'memo_number', 'email', 'necessity'],
      // softDeleteField omitted karena schema tidak punya deleted_at
    };
  }

  // ---------------- CREATE ----------------
  async createItemMovement(data: CreateItemMovementDto) {
    // optional conflict check (name + email)
    const exists = await (this.prismaService.db as any).itemMovement.findFirst({
      where: {
        AND: [{ name: data.name }, { email: data.email }],
      },
    });

    if (exists) {
      throw new ConflictException('Item Movement dengan nama/email ini sudah ada');
    }

    return (this.prismaService.db as any).itemMovement.create({
      data: {
        name: data.name,
        memo_number: data.memo_number ?? null,
        email: data.email ?? null,
        necessity: data.necessity ?? null,
        request_date: data.request_date ? new Date(data.request_date) : null,
        created_by: data.created_by ?? null,
        updated_by: null,
        details: data.details
          ? {
              create: data.details.map((d) => ({
                sku_id: d.sku_id,
                item_id: d.item_id ?? null,
              })),
            }
          : undefined,
      },
      include: {
        details: {
          include: {
            sku: true,
            item: true,
          },
        },
      },
    });
  }

  // ---------------- PAGINATED LIST ----------------
  async findAllItemMovementsPaginated(pagination: PaginationDto) {
    const select = {
      id: true,
      name: true,
      memo_number: true,
      email: true,
      necessity: true,
      request_date: true,
      created_by: true,
      updated_by: true,
    };

    // BaseService.findAllPaginated digunakan seperti ODTW
    return this.findAllPaginated(pagination, {}, select);
  }

  // ---------------- FIND BY ID ----------------
  async findItemMovementById(id: string) {
    const data = await (this.prismaService.db as any).itemMovement.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
        details: {
          include: {
            sku: {
              include: {
                // tergantung schema sku relation, tetap hati-hati
                item: true,
                warehouse: true,
              },
            },
            item: true,
          },
        },
      },
    });

    if (!data) throw new NotFoundException('Item Movement not found');
    return data;
  }

  // ---------------- UPDATE ----------------
  async updateItemMovement(id: string, data: UpdateItemMovementDto) {
    // pastikan ada dulu
    await this.findItemMovementById(id);

    const { details, ...rest } = data as any;

    // update parent
    await (this.prismaService.db as any).itemMovement.update({
      where: { id },
      data: {
        ...rest,
        updated_by: data.updated_by ?? null,
        request_date: data.request_date ? new Date(data.request_date) : undefined,
      },
    });

    // jika details dikirim -> hapus semua lalu createMany (simple replace)
    if (Array.isArray(details)) {
      await (this.prismaService.db as any).itemMovementDetail.deleteMany({
        where: { item_movement_id: id },
      });

      // gunakan createMany jika banyak, atau loop create
      if (details.length > 0) {
        await (this.prismaService.db as any).itemMovementDetail.createMany({
          data: details.map((d) => ({
            item_movement_id: id,
            sku_id: d.sku_id,
            item_id: d.item_id ?? null,
          })),
        });
      }
    }

    return this.findItemMovementById(id);
  }

  // ---------------- HARD DELETE ----------------
  // (schema tidak punya deleted_at, jadi kita tampilkan hard delete. Kalau mau soft delete, tambahkan field deleted_at di schema)
  async removeItemMovement(id: string) {
    await this.findItemMovementById(id);

    // hapus details dulu untuk safety (cascade mungkin sudah ada tergantung schema)
    await (this.prismaService.db as any).itemMovementDetail.deleteMany({
      where: { item_movement_id: id },
    });

    return (this.prismaService.db as any).itemMovement.delete({
      where: { id },
    });
  }

  // ---------------- FILTER ----------------
  async getItemMovementsByFilter(filters: ColumnFilterDto[]) {
    const options = this.getQueryOptions();
    const params = QueryBuilderService.buildQueryParams(
      { filters } as PaginationDto,
      options,
    );

    // BaseService.findAll menerima params (sama seperti ODTW)
    return this.findAll(params);
  }
}
