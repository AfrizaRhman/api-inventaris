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
} from '../common/dto/pagination.dto';

import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';

@Injectable()
export class ItemMovementService extends BaseService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  /* ================= BASE CONFIG ================= */

  protected getModel() {
    return this.prisma.itemMovement;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      softDeleteField: 'deleted_at',

      defaultSortField: 'request_date',
      defaultSortDirection: SortDirection.DESC,

      allowedSortFields: [
        'request_date',
        'name',
        'email',
        'phone_number',
        'necessity',
      ],

      allowedFilterFields: [
        'name',
        'email',
        'phone_number',
        'necessity',
        'request_date',
      ],

      defaultSearchFields: [
        'name',
        'email',
        'phone_number',
        'necessity',
      ],

      defaultInclude: {
        details: {
          where: { deleted_at: null },
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

      allowedIncludes: ['details'],
    };
  }

  /* ================= CREATE ================= */

  async createItemMovement(dto: CreateItemMovementDto) {
    const exists = await this.prisma.itemMovement.findFirst({
      where: {
        AND: [{ name: dto.name }, { email: dto.email }],
      },
    });

    if (exists) {
      throw new ConflictException(
        'Item Movement dengan nama/email ini sudah ada',
      );
    }

    return this.prisma.itemMovement.create({
      data: {
        name: dto.name,
        phone_number: dto.phone_number ?? null,
        email: dto.email ?? null,
        necessity: dto.necessity ?? null,
        request_date: dto.request_date
          ? new Date(dto.request_date)
          : null,
        created_by: dto.created_by ?? null,
        updated_by: null,

        details: dto.details?.length
          ? {
              create: dto.details.map((d) => ({
                sku_id: d.sku_id,
                sku_code: d.sku_code ?? null,
              })),
            }
          : undefined,
      },
      include: {
        details: {
          where: { deleted_at: null },
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

  /* ================= FIND ALL ================= */
  /**
   * GET /item-movement
   * ✔ pagination
   * ✔ search
   * ✔ filter
   * ✔ include details
   */
  async findAllItemMovements(pagination: PaginationDto) {
    return this.findAllPaginated(
      pagination,
      {}, // additional where
      {
        details: {
          where: { deleted_at: null },
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
    );
  }

  /* ================= FIND ONE ================= */

  async findItemMovementById(id: string) {
    const data = await this.findById(id, {
      details: {
        where: { deleted_at: null },
        include: {
          sku: {
            include: {
              item: true,
              warehouse: true,
            },
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Item Movement not found');
    }

    return data;
  }

  /* ================= UPDATE ================= */

  async updateItemMovement(id: string, dto: UpdateItemMovementDto) {
    await this.findItemMovementById(id);

    const { details, ...rest } = dto;

    await super.update(id, {
      ...rest,
      request_date: dto.request_date
        ? new Date(dto.request_date)
        : undefined,
      updated_by: dto.updated_by ?? null,
    });

    if (Array.isArray(details)) {
      await this.prisma.itemMovementDetail.deleteMany({
        where: { item_movement_id: id },
      });

      if (details.length > 0) {
        await this.prisma.itemMovementDetail.createMany({
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

  /* ================= DELETE ================= */

  softDeleteItemMovement(id: string) {
    return super.softDelete(id);
  }

  restoreItemMovement(id: string) {
    return super.restore(id);
  }

  hardDeleteItemMovement(id: string) {
    return super.hardDelete(id);
  }
}
