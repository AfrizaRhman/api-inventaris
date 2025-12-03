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
import { QueryBuilderService } from 'src/common/services/query-builder.service';

@Injectable()
export class ItemMovementService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.itemMovement; // FIXED
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'name',
      defaultSortDirection: SortDirection.ASC,
      allowedSortFields: [
        'id',
        'name',
        'email',
        'necessity',
        'request_date',
        'created_by',
        'updated_by',
      ],
      allowedFilterFields: [
        'id',
        'name',
        'email',
        'necessity',
        'request_date',
        'created_by',
        'updated_by',
      ],
      defaultSearchFields: ['name', 'email', 'necessity'],
    };
  }

  // -------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------
  async createItemMovement(data: CreateItemMovementDto) {
    const exists = await this.prismaService.itemMovement.findFirst({
      where: {
        AND: [{ name: data.name }, { email: data.email }],
      },
    });

    if (exists) {
      throw new ConflictException(
        'Item Movement dengan nama/email ini sudah ada',
      );
    }

    return this.prismaService.itemMovement.create({
      data: {
        name: data.name,
        phone_number: data.phone_number ?? null,
        email: data.email ?? null,
        necessity: data.necessity ?? null,
        request_date: data.request_date ? new Date(data.request_date) : null,
        created_by: data.created_by ?? null,
        updated_by: null,

        details: {
          create: (data.details || []).map((d) => ({
            sku_id: d.sku_id,
            sku_code: d.sku_code ?? null,
          })),
        },
      },
      include: {
        details: {
          include: {
            sku: {
              include: {
                item: true,
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  // -------------------------------------------------------------
  // PAGINATION
  // -------------------------------------------------------------
  async findAllItemMovementsPaginated(pagination: PaginationDto) {
    const select = {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      necessity: true,
      request_date: true,
      created_by: true,
      updated_by: true,
    };

    return this.findAllPaginated(pagination, {}, select);
  }

  // -------------------------------------------------------------
  // FIND BY ID
  // -------------------------------------------------------------
  async findItemMovementById(id: string) {
    const data = await this.prismaService.itemMovement.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            sku: { include: { item: true } },
          },
        },
      },
    });

    if (!data) throw new NotFoundException('Item Movement not found');
    return data;
  }

  // -------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------
  async updateItemMovement(id: string, data: UpdateItemMovementDto) {
    await this.findItemMovementById(id);

    const { details, ...rest } = data;

    await this.prismaService.itemMovement.update({
      where: { id },
      data: {
        ...rest,
        updated_by: data.updated_by ?? null,
        request_date: data.request_date
          ? new Date(data.request_date)
          : undefined,
      },
    });

    if (Array.isArray(details)) {
      await this.prismaService.itemMovementDetail.deleteMany({
        where: { item_movement_id: id },
      });

      if (details.length > 0) {
        await this.prismaService.itemMovementDetail.createMany({
          data: details.map((d) => ({
            item_movement_id: id,
            sku_id: d.sku_id,
            sku_code: d.sku_code ?? null,
          })),
        });
      }
    }

    return this.findItemMovementById(id);
  }

  // -------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------
  async removeItemMovement(id: string) {
    await this.findItemMovementById(id);

    await this.prismaService.itemMovementDetail.deleteMany({
      where: { item_movement_id: id },
    });

    return this.prismaService.itemMovement.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // FILTER
  // -------------------------------------------------------------
  async getItemMovementsByFilter(filters: ColumnFilterDto[]) {
    const options = this.getQueryOptions();
    const params = QueryBuilderService.buildQueryParams(
      { filters } as PaginationDto,
      options,
    );

    return this.findAll(params);
  }
}
