import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';

import { CreateItemMovementDto } from './dto/create-item-movement.dto';
import { UpdateItemMovementDto } from './dto/update-item-movement.dto';
import { QueryBuilderOptions } from 'src/common/dto/pagination.dto';

@Injectable()
export class ItemMovementService extends BaseService<any> {
  protected getModel() {
    throw new Error('Method not implemented.');
  }
  protected getQueryOptions(): QueryBuilderOptions {
    throw new Error('Method not implemented.');
  }
  [x: string]: any;
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  /* ======================================================
        CREATE
  ====================================================== */
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
        request_date: data.request_date
          ? new Date(data.request_date)
          : null,
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

  /* ======================================================
        ✅ GET ALL ITEM MOVEMENT (FIXED)
  ====================================================== */
  async findAllItemMovements() {
    return this.prismaService.itemMovement.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
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

  /* ======================================================
        FIND BY ID
  ====================================================== */
  async findItemMovementById(id: string) {
    const data = await this.prismaService.itemMovement.findUnique({
      where: { id },
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

    if (!data) {
      throw new NotFoundException('Item Movement not found');
    }

    return data;
  }

  /* ======================================================
        UPDATE
  ====================================================== */
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

  /* ======================================================
        SOFT DELETE / RESTORE / HARD DELETE
  ====================================================== */
  async softDelete(id: string) {
    return super.softDelete(id);
  }

  async restore(id: string) {
    return super.restore(id);
  }

  async hardDelete(id: string) {
    return super.hardDelete(id);
  }
}
