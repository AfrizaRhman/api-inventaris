/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseService } from '../common/services/base.service';
import {
  QueryBuilderOptions,
  SortDirection,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService extends BaseService<any> {
  constructor(protected prismaService: PrismaService) {
    super(prismaService);
  }

  protected getModel() {
    return this.prismaService.db.item;
  }

  protected getQueryOptions(): QueryBuilderOptions {
    return {
      defaultSortField: 'createdAt',
      defaultSortDirection: SortDirection.DESC,
      allowedSortFields: ['id', 'name', 'price', 'stock', 'createdAt', 'updatedAt'],
      allowedFilterFields: ['id', 'name', 'price', 'stock', 'category_id', 'unit_id'],
      defaultSearchFields: ['name', 'suplier', 'code'],
      softDeleteField: 'deleted_at',
    };
  }

  private readonly itemInclude = {
    unit: true,
    category: true,
    sku: {
      include: {
        loanDetail: true,
        itemMovementDetail: true,
      },
    },
  };

  private async ensureExists(model: 'unit' | 'category', id?: string) {
    if (!id) return;

    const record = await (this.prismaService.db as any)[model].findUnique({
      where: { id },
    });

    if (!record) {
      throw new BadRequestException(`${model} with ID '${id}' does not exist.`);
    }
  }

  // CREATE
  async createItem(dto: CreateItemDto) {
    await this.ensureExists('unit', dto.unit_id);
    await this.ensureExists('category', dto.category_id);

    return this.create(
      {
        name: dto.name,
        // suplier: dto.suplier ?? null,
        price: dto.price ?? null,
        stock: dto.stock,
        description: dto.description ?? null,
        code: dto.code ?? null,
        image: dto.image ?? null,
        unit_id: dto.unit_id,
        category_id: dto.category_id,
      },
      this.itemInclude,
    );
  }

  // PAGINATION
  async findAllItemsPaginated(paginationDto: PaginationDto, where = {}) {
    return this.findAllPaginated(
      paginationDto,
      { ...where, deleted_at: null },
      this.itemInclude,
    );
  }

  // FIND ONE
  async findItemById(id: string) {
    const item = await this.findById(id, this.itemInclude);

    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);

    return item;
  }

  // UPDATE
  async updateItem(id: string, dto: UpdateItemDto) {
    await this.findItemById(id);

    if (dto.unit_id) await this.ensureExists('unit', dto.unit_id);
    if (dto.category_id) await this.ensureExists('category', dto.category_id);

    return this.update(
      id,
      {
        name: dto.name ?? undefined,
        // suplier: dto.suplier ?? undefined,
        price: dto.price ?? undefined,
        stock: dto.stock ?? undefined,
        description: dto.description ?? undefined,
        code: dto.code ?? undefined,
        image: dto.image ?? undefined,
        unit_id: dto.unit_id ?? undefined,
        category_id: dto.category_id ?? undefined,
      },
      this.itemInclude,
    );
  }

  // SOFT DELETE
  async softDeleteItem(id: string) {
    return this.update(id, {
      deleted_at: Math.floor(Date.now() / 1000),
    });
  }

  // HARD DELETE
  async deleteItemPermanently(id: string) {
    return this.permanentDelete(id);
  }
}
